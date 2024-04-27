module suisnails::billboard {
  
  const ROW_COUNT: u64 = 20;
  const COL_COUNT: u64 = 60;
  
  const INIT_COLOR: vector<u8> = vector<u8>[0,0,0];
  const INIT_OWNER: address = @0xdc9d3855fb66bb34abcd4c18338bca6c568b7beaf3870c5dd3f9d3441c2cf11d;
  const INIT_FEE: u64 = 10_000_000;
  
  public struct Billboard has store, copy, drop {
    spaces: vector<vector<Option<Pixel>>>,
  }
  
  public struct Pixel has store, copy, drop {
    owner: address,
    color: vector<u8>,
    fee: u64,
    row: u64,
    col: u64,
  }
  
  // ===== Public Functions =====
  
  public fun row_count(): u64 {
    ROW_COUNT
  }
    
  public fun col_count(): u64 {
    COL_COUNT
  }
  
  // ===== Create Board =====
  
  public(package) fun new(): Billboard {
    let mut spaces = vector[];
    
    let mut i=0;
    
    while (i < ROW_COUNT) {
      let mut row = vector[];
      let mut j=0;
      while (j < COL_COUNT) {
        let pixel = create_pixel(INIT_OWNER, INIT_COLOR, i, j);
        vector::push_back(&mut row, option::some(pixel));
        j = j + 1;
      };
      vector::push_back(&mut spaces, row);
      i = i + 1;
    };
    
    let billboard = create_board(spaces);
    
    billboard
  }
  
  public(package) fun create_board(spaces: vector<vector<Option<Pixel>>>): Billboard {
    Billboard { 
      spaces,
    }
  }
  
  fun create_pixel(owner: address, color: vector<u8>, row: u64, col: u64): Pixel {
    Pixel {
      owner,
      color,
      row,
      col,
      fee: INIT_FEE,
    }
  }
  
  public(package) fun spaces(board: &Billboard): &vector<vector<Option<Pixel>>> {
    &board.spaces
  }
  
  // ===== Modify Billboard =====
  
  public(package) fun modify(
    board: &mut Billboard,
    new_owner: address,
    new_colors: vector<vector<u8>>,
    rows: vector<u64>,
    cols: vector<u64>,
    change_count: u64,
) {
  let mut i = 0;
  while (i < change_count) {
    let row = *vector::borrow(&rows, i); // Direct dereferencing after borrowing
    let col = *vector::borrow(&cols, i);
    let new_color = *vector::borrow(&new_colors, i); // Assuming this needs direct dereferencing
    
    let position = space_at_mut(board, row, col);
    let pixel = option::borrow_mut(position);
  
    pixel.owner = new_owner;
    pixel.color = new_color;
    pixel.fee = pixel.fee * 2;  // Double the fee as per your existing logic
    
    i = i + 1;
  }
}
  
  fun spaces_at(spaces: &vector<vector<Option<Pixel>>>, row_index: u64, col_index: u64): &Option<Pixel> {
    let row = vector::borrow(spaces, row_index);
    vector::borrow(row, col_index)
  }
  
  fun spaces_at_mut(spaces: &mut vector<vector<Option<Pixel>>>, row_index: u64, col_index: u64): &mut Option<Pixel> {
    let row = vector::borrow_mut(spaces, row_index);
    vector::borrow_mut(row, col_index)
  }
  
  public(package) fun space_at(board: &Billboard, row_index: u64, col_index: u64): &Option<Pixel> {
    spaces_at(&board.spaces, row_index, col_index)
  }
  
  public(package) fun space_at_mut(board: &mut Billboard, row_index: u64, col_index: u64): &mut Option<Pixel> {
    spaces_at_mut(&mut board.spaces, row_index, col_index)
  }
  
  public(package) fun pixel_at_space(spaces: &vector<vector<Option<Pixel>>>, row: u64, col: u64): Pixel {
    let option = spaces_at(spaces, row, col);
    
    if (option::is_none(option)) {
      return Pixel { 
        owner: @0x0,
        color: vector<u8>[0,0,0],
        fee: 0,
        row: 0,
        col: 0,
      }
    };
    
    *option::borrow(option)
  }
  
  public(package) fun pixel_at(board: &Billboard, row: u64, col: u64): Pixel {
    pixel_at_space(&board.spaces, row, col)
  }
  
  public(package) fun fee_at(board: &Billboard, row: u64, col: u64): u64 {
    let pixel = pixel_at(board, row, col);
    pixel.fee
  }
  
  public(package) fun owner_at(board: &Billboard, row: u64, col: u64): address {
    let pixel = pixel_at(board, row, col);
    pixel.owner
  }
}