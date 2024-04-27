const fetchRecentBillboardPurchases = async (sectionAddress, afterCursor = null) => {
  let events = [];
  let hasNextPage = true; // Reset hasNextPage for each section
  let endCursor = afterCursor;
  
  let queryEvents = `query {
    events(
      first: 4
      ${endCursor ? `after: "${endCursor}"` : ''}
      filter: {
        eventType: "${sectionAddress}::billboard_game::BillboardActionEvent"
      }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        timestamp
        json
      }
    }
  }`;

  while (hasNextPage) {
    try {
      const response = await fetch("https://sui-testnet.mystenlabs.com/graphql", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: queryEvents }),
      });

      const jsonData = await response.json();
      hasNextPage = jsonData.data.events.pageInfo.hasNextPage; // Update hasNextPage based on the latest fetch
      
      const nodes = jsonData.data.events.nodes.map((node) => ({
        timestamp: node.timestamp,
        owner: node.json.player, 
        purchaseCount: node.json.rows.length 
      }));

      events.push(...nodes);
      
      if (jsonData.data.events.pageInfo.endCursor) {
        endCursor = jsonData.data.events.pageInfo.endCursor;
        queryEvents = `query {
          events(
            first: 4
            after: "${endCursor}"
            filter: {
              eventType: "${sectionAddress}::billboard_game::BillboardActionEvent",
            }
          ) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              timestamp
              json
            }
          }
        }`;
      } else {
        hasNextPage = false;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      hasNextPage = false;
    }
  }
  
  return events;
}

export default fetchRecentBillboardPurchases;
