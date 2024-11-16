class Connection {
  constructor(endpoint) {
    this.endpoint = endpoint; // The URL to your RPC server
  }

  async sendRpcRequest(method, params) {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1, // Random ID for the request
          method,
          params,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }

      return data.result;
    } catch (error) {
      console.error("Error sending RPC request:", error);
      throw error;
    }
  }

  // Method to get the balance of a public key
  async getBalance(publicKey) {
    return this.sendRpcRequest('getBalance', [publicKey]);
  }
}

// Usage example
const connection = new Connection('http://localhost:5700/rpc'); // Your RPC server URL
const publicKey = 'GLNEBTiGUZk2YTGe5pURaKnRwAh1fJwvNiijr2NK5SXR';

connection.getBalance(publicKey)
  .then(balance => {
    console.log("Balance:", balance.value); // Access the balance value from the result
  })
  .catch(error => {
    console.error("Failed to fetch balance:", error);
  });
