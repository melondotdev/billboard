module suisnails::billboard_game {
  use std::string::{Self, String};
  use sui::tx_context::{sender};
  use sui::url::{Self, Url};
  use sui::event;
  
  use sui::sui::SUI;
  use sui::balance::{Self, Balance};
  use sui::coin::{Self, Coin};
  use sui::pay;
  
  use suisnails::billboard::{Self, Billboard};
  
  const ENotMaintainer: u64 = 1;
  const ENoBalance: u64 = 2;
  
  public struct BillboardGame has key, store {
    id: UID,
    name: String,
    description: String,
    url: Url,
    grid: Billboard,
  }
  
  public struct BillboardAdminCap has key, store {
    id: UID,
    name: String,
    description: String,
    url: Url,
  }
  
  public struct BillboardMaintainer has key {
    id: UID,
    maintainer_address: address,
    balance: Balance<SUI>,
  }
  
  public struct BillboardActionEvent has copy, drop {
    player: address,
    new_colors: vector<vector<u8>>,
    rows: vector<u64>,
    cols: vector<u64>,
    fee: u64,
  }
  
  fun init(ctx: &mut TxContext) {
    let game_uid = object::new(ctx);
    let admin = tx_context::sender(ctx);
    let new_grid = billboard::new();
    
    let name = string::utf8(b"Sui Snails Billboard");
    let description = string::utf8(b"Billboard - built on Sui - by Sui Snails");
    let url = url::new_unsafe_from_bytes(b"https://bafybeicxo6s7wu62dxzurmvnmqqadinpr37p2wm6fou6srotsictjgp3ia.ipfs.nftstorage.link/");
    
    let game = BillboardGame {
      id: game_uid,
      name,
      description,
      url,
      grid: new_grid,
    };
    
    let admin_cap = BillboardAdminCap {
      id: object::new(ctx),
      name,
      description,
      url,
    };
    
    let maintainer = BillboardMaintainer {
      id: object::new(ctx),
      maintainer_address: sender(ctx),
      balance: balance::zero<SUI>(),
    };
    
    transfer::share_object(game);
    transfer::transfer(admin_cap, admin);
    transfer::share_object(maintainer);
  }
  
  // ===== Public Entry Functions =====
  
  public entry fun take_action(
    game: &mut BillboardGame,
    new_colors: vector<vector<u8>>, 
    rows: vector<u64>, 
    cols: vector<u64>, 
    change_count: u64, 
    maintainer: &mut BillboardMaintainer,
    fee: vector<Coin<SUI>>,
    ctx: &mut TxContext
  ) {
    let player = tx_context::sender(ctx);
    
    let (all_owners, all_fees, total_fee) = calculate_fees(game, &rows, &cols);
    
    let maintainer_fee = total_fee / 10; // Calculating 10% for maintainer
    let (paid, remainder) = merge_and_split(fee, maintainer_fee, ctx);
    
    coin::put(&mut maintainer.balance, paid); // Pay maintainer
    
    let final_remainder = distribute_fees(remainder, all_owners, all_fees, ctx);
    
    billboard::modify(&mut game.grid, player, new_colors, rows, cols, change_count);
    
    event::emit(BillboardActionEvent {
      player,
      new_colors,
      rows,
      cols,
      fee: total_fee,
    });
    
    transfer::public_transfer(final_remainder, tx_context::sender(ctx));
  }
  
  public fun fee_at(game: &BillboardGame, row: u64, col: u64): u64 {
    let grid = &game.grid;
    suisnails::billboard::fee_at(grid, row, col)
  }
  
  public fun owner_at(game: &BillboardGame, row: u64, col: u64): address {
    let grid = &game.grid;
    suisnails::billboard::owner_at(grid, row, col)
  }
  
  // ===== Maintainer Functions =====
  
  public entry fun pay_maintainer(maintainer: &mut BillboardMaintainer, ctx: &mut TxContext) {
    assert!(tx_context::sender(ctx) == maintainer.maintainer_address, ENotMaintainer);
    let amount = balance::value<SUI>(&maintainer.balance);
    assert!(amount > 0, ENoBalance);
    let payment = coin::take(&mut maintainer.balance, amount, ctx);
    transfer::public_transfer(payment, tx_context::sender(ctx));
  }
  
  public entry fun change_maintainer(maintainer: &mut BillboardMaintainer, new_maintainer: address, ctx: &mut TxContext) {
    assert!(tx_context::sender(ctx) == maintainer.maintainer_address, ENotMaintainer);
    maintainer.maintainer_address = new_maintainer;
  }
  
  fun merge_and_split(
    mut coins: vector<Coin<SUI>>, amount: u64, ctx: &mut TxContext
  ): (Coin<SUI>, Coin<SUI>) {
    let mut base = vector::pop_back(&mut coins);
    pay::join_vec(&mut base, coins);
    let coin_value = coin::value(&base);
    assert!(coin_value >= amount, coin_value);
    (coin::split(&mut base, amount, ctx), base)
  }

  // Helper function to calculate fees for each pixel change
  fun calculate_fees(game: &BillboardGame, rows: &vector<u64>, cols: &vector<u64>): (vector<address>, vector<u64>, u64) {
    let mut all_owners: vector<address> = vector<address> [];
    let mut all_fees: vector<u64> = vector<u64> [];
    let mut total_fee: u64 = 0;
    
    let count = vector::length(rows);
    let mut i = 0;
    while (i < count) {
      let row = vector::borrow(rows, i);
      let col = vector::borrow(cols, i);
      let fee = suisnails::billboard::fee_at(&game.grid, *row, *col);
      let adjusted_fee = fee * 9 / 10;
      let owner = suisnails::billboard::owner_at(&game.grid, *row, *col);

      if (vector::contains(&all_owners, &owner)) {
        vector::push_back(&mut all_fees, 0);
        let (_x, index) = vector::index_of(&all_owners, &owner);
        let original_fee = vector::swap_remove(&mut all_fees, index);
        let updated_fee = original_fee + adjusted_fee;
        vector::push_back(&mut all_fees, updated_fee);
        vector::swap_remove(&mut all_fees, index);
      } else {
        vector::push_back(&mut all_owners, owner);
        vector::push_back(&mut all_fees, adjusted_fee);
      };

      total_fee = total_fee + fee;
      i = i + 1
    };
    
    (all_owners, all_fees, total_fee)
  }
  
  fun distribute_fees(
    mut remainder: Coin<SUI>,
    all_owners: vector<address>, 
    all_fees: vector<u64>,
    ctx: &mut TxContext
  ): Coin<SUI> {
    let mut i = 0;
    let count = vector::length(&all_owners);
    
    while (i < count) {
      let payee = vector::borrow(&all_owners, i);
      let amount = vector::borrow(&all_fees, i);

      // Check if the remainder has enough balance to cover the payment
      assert!(coin::value(&remainder) >= *amount, ENoBalance);

      // Split the specific amount from the remainder
      let payment = coin::split(&mut remainder, *amount, ctx);
      
      // Transfer the split coin to the respective payee
      transfer::public_transfer(payment, *payee);
      
      i = i + 1;
    };
    
    remainder
  }
}