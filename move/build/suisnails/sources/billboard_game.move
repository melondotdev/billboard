module suisnails::billboard_game {
  use std::string::{Self, String};
  use sui::object::{Self, UID};
  use sui::tx_context::{Self, TxContext};
  use sui::url::{Self, Url};
  use sui::event;
  use sui::transfer;
  
  use suisnails::billboard::{Self, Billboard};
  
  struct BillboardGame has key, store {
    id: UID,
    name: String,
    description: String,
    url: Url,
    section: Billboard,
  }
  
  struct BillboardAdminCap has key, store {
    id: UID,
    name: String,
    description: String,
    url: Url,
  }
  
  struct BillboardActionEvent has copy, drop {
    section: Billboard,
    player: address,
    new_colors: vector<vector<u8>>,
    rows: vector<u64>,
    cols: vector<u64>,
  }
  
  fun init(ctx: &mut TxContext) {
    let game_uid = object::new(ctx);
    let admin = tx_context::sender(ctx);
    let new_section = billboard::new();
    
    let name = string::utf8(b"Sui Snails Billboard");
    let description = string::utf8(b"Billboard - built on Sui - by Sui Snails");
    let url = url::new_unsafe_from_bytes(b"https://bafybeicxo6s7wu62dxzurmvnmqqadinpr37p2wm6fou6srotsictjgp3ia.ipfs.nftstorage.link/");
    
    let game = BillboardGame {
      id: game_uid,
      name,
      description,
      url,
      section: new_section,
    };
    
    let admin_cap = BillboardAdminCap {
      id: object::new(ctx),
      name,
      description,
      url,
    };
    
    transfer::share_object(game);
    transfer::transfer(admin_cap, admin);
  }

  // ===== Public Entry Functions =====
  
  public entry fun take_action(game: &mut BillboardGame, new_colors: vector<vector<u8>>, rows: vector<u64>, cols: vector<u64>, change_count: u64, ctx: &mut TxContext) {
    let player = tx_context::sender(ctx);
    
    billboard::modify(&mut game.section, player, new_colors, rows, cols, change_count);
    
    event::emit(BillboardActionEvent {
      section: game.section,
      player,
      new_colors,
      rows,
      cols,
    });
  }
}