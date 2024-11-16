class Connection {
  constructor(environment = 'devNet', useHttps = false) {
    this.endpoint = clusterApiUrl(environment, useHttps);
  }

  // Example: Get account balance
  async getBalance(publicKey) {
    try {
      const response = await fetch(`${this.endpoint}/getBalance?publicKey=${publicKey}`);
      const data = await response.json();
      return data.balance; // Adjust according to API response
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  }

  // Example: Get the latest blockhash
  async getLatestBlockhash() {
    try {
      const response = await fetch(`${this.endpoint}/getLatestBlockhash`);
      const data = await response.json();
      return data.blockhash; // Adjust according to API response
    } catch (error) {
      console.error("Error fetching blockhash:", error);
    }
  }

  // Example: Send a transaction
  async sendTransaction(transaction) {
    try {
      const response = await fetch(`${this.endpoint}/sendTransaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });
      const data = await response.json();
      return data.signature; // Adjust according to API response
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  }
}

export { Connection };
