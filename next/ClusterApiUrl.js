// Define an object to hold the API endpoints for different environments
const endPoints = {
  http: {
    devNet: 'http://localhost:5700/api/v2/devNet',
    testNet: 'http://localhost:5700/api/v2/testNet',
    mainNet: 'http://localhost:5700/api/v2/mainNet',
  },
  https: {
    devNet: 'https://localhost:5700/api/v2/devNet',
    testNet: 'https://localhost:5700/api/v2/testNet',
    mainNet: 'https://localhost:5700/api/v2/mainNet',
  },
};

// Function to get the RPC API URL
function clusterApiUrl(environment = 'devNet', useHttps = false) {
  // Determine the protocol to use (http or https)
  const protocol = useHttps ? 'https' : 'http';

  // Check if the environment is valid and retrieve the URL
  const url = endPoints[protocol][environment];

  if (!url) {
    throw new Error(`Unknown ${protocol} environment: ${environment}`);
  }

  return url;
}

export default clusterApiUrl;