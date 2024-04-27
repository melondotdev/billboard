import { 
  BILLBOARD_SECTION_1_GAME, 
  BILLBOARD_SECTION_2_GAME, 
  BILLBOARD_SECTION_3_GAME, 
  BILLBOARD_SECTION_4_GAME, 
} from '../../lib/constants';

const fetchBillboardData = async () => {
  const sections = [BILLBOARD_SECTION_1_GAME, BILLBOARD_SECTION_2_GAME, BILLBOARD_SECTION_3_GAME, BILLBOARD_SECTION_4_GAME];
  let allPixels = [];
  
  for (let section of sections) {
    let pixels = [];
    
    let queryPixels = `query {
      object (address: "${section}") {
        asMoveObject {
          contents {
            json
          }
        }
      }
    }`;
    
    try {
      const response = await fetch("https://sui-testnet.mystenlabs.com/graphql", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: queryPixels }),
      });
      
      const jsonData = await response.json();
      
      const nodes = jsonData.data.object.asMoveObject.contents.json.grid.spaces.map((row) => 
        row.map((subnode) => ({
          owner: subnode.owner,
          fee: subnode.fee,
          row: subnode.row,
          col: subnode.col,
          color: subnode.color
        }))
      );
      
      pixels.push(...nodes);
      
    } catch (error) {
      console.error("Error fetching data from", section, ":", error);
    }
    
    allPixels.push({
      section: section,
      pixels: pixels
    });
  }
  
  return allPixels;
}

export default fetchBillboardData;
