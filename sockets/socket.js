const WebSocket = require('ws');
const db = require('../dbConfig/db');

const wss = new WebSocket.Server({ noServer: true });

const handleWebSocketConnection = (ws, req) => {
  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message);

    switch (parsedMessage.type) {
      case 'bid':
        handleBid(ws, parsedMessage.data);
        break;
      default:
        console.error('Unknown message type:', parsedMessage.type);
    }
  });

  ws.send(JSON.stringify({ type: 'connection', data: 'Connection established' }));
};

const handleBid = async (ws, data) => {
  const { itemId, bid_amount, userId } = data;

  try {
    // Get the current highest bid amount for the item
    const [item] = await db.query('SELECT highest_bid_amount FROM items WHERE id = ?', [itemId]);
    const currentHighestBidAmount = item[0].highest_bid_amount;

    // Check if the new bid is higher than the current highest bid
    if (bid_amount > currentHighestBidAmount) {
      // Update the highest bid amount for the item in the database
      await db.query('UPDATE items SET highest_bid_amount = ? WHERE id = ?', [bid_amount, itemId]);

      // Create a notification for the previous highest bidder (if any)
      if (currentHighestBidAmount > 0) {
        const [previousBidder] = await db.query('SELECT user_id FROM bids WHERE item_id = ? AND bid_amount = ?', [itemId, currentHighestBidAmount]);
        const previousBidderId = previousBidder[0].user_id;
        const outbidMessage = `You have been outbid on item ${itemId}.`;
        await db.query('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [previousBidderId, outbidMessage]);

        // Send WebSocket notification to the previous bidder
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'notify', data: { userId: previousBidderId, message: outbidMessage } }));
          }
        });
      }

      // Create a notification for the item owner
      const [owner] = await db.query('SELECT user_id FROM items WHERE id = ?', [itemId]);
      const ownerId = owner[0].user_id;
      const newBidMessage = `A new bid has been placed on your item ${itemId}.`;
      await db.query('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [ownerId, newBidMessage]);

      // Send WebSocket notification to the item owner
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'notify', data: { userId: ownerId, message: newBidMessage } }));
        }
      });
    }

    // Insert bid into database
    await db.query('INSERT INTO bids (item_id, user_id, bid_amount) VALUES (?, ?, ?)', [itemId, userId, bid_amount]);

    // Send confirmation message to the bidder
    ws.send(JSON.stringify({ type: 'bidPlaced', message: 'Bid placed successfully' }));
  } catch (error) {
    console.error('Error handling bid:', error);
    ws.send(JSON.stringify({ type: 'error', message: 'Internal server error' }));
  }
};


module.exports = { wss, handleWebSocketConnection };
