/**
 * Test script to verify the connection between VSCode extension and Mooch bridge
 */

const axios = require('axios');

async function testBridgeConnection() {
    console.log('Testing connection to Mooch bridge...');
    
    try {
        // Test health endpoint
        console.log('\n1. Testing health endpoint...');
        const healthResponse = await axios.get('http://127.0.0.1:62544/health', {
            headers: {
                'X-Mooch-Client': 'vscode-extension-test'
            }
        });
        console.log('✓ Health check successful:', healthResponse.data);
        
        // Test analyze endpoint
        console.log('\n2. Testing analyze endpoint...');
        const analyzeResponse = await axios.post('http://127.0.0.1:62544/api/analyze', {
            code: 'function hello() {\n  return "Hello, World!";\n}',
            context: 'Testing VSCode extension integration'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-Mooch-Client': 'vscode-extension-test'
            }
        });
        console.log('✓ Analysis successful:', typeof analyzeResponse.data.analysis.substring(0, 100) + '...');
        
        console.log('\n✓ All tests passed! The VSCode extension should be able to communicate with the Mooch bridge.');
        
    } catch (error) {
        console.error('✗ Error during testing:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

// Run the test
testBridgeConnection();