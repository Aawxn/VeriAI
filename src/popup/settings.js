/**
 * Settings page script for VeriAI
 * Handles API key configuration
 */

// Load saved settings on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
});

/**
 * Load settings from Chrome storage
 */
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get([
      'claudeApiKey',
      'geminiApiKey',
      'deepseekApiKey',
      'useClaudeForVerification',
      'useClaudeForMeta'
    ]);

    // Populate fields
    if (result.claudeApiKey) {
      document.getElementById('claudeApiKey').value = result.claudeApiKey;
    }
    if (result.geminiApiKey) {
      document.getElementById('geminiApiKey').value = result.geminiApiKey;
    }
    if (result.deepseekApiKey) {
      document.getElementById('deepseekApiKey').value = result.deepseekApiKey;
    }

    // Set checkboxes
    document.getElementById('useClaudeForVerification').checked = 
      result.useClaudeForVerification !== false; // Default to true
    document.getElementById('useClaudeForMeta').checked = 
      result.useClaudeForMeta !== false; // Default to true

  } catch (error) {
    console.error('Failed to load settings:', error);
    showStatus('Failed to load settings', 'error');
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  document.getElementById('saveBtn').addEventListener('click', saveSettings);
  document.getElementById('testBtn').addEventListener('click', testAPIs);
  document.getElementById('cancelBtn').addEventListener('click', () => {
    window.close();
  });
}

/**
 * Save settings to Chrome storage
 */
async function saveSettings() {
  try {
    const settings = {
      claudeApiKey: document.getElementById('claudeApiKey').value.trim(),
      geminiApiKey: document.getElementById('geminiApiKey').value.trim(),
      deepseekApiKey: document.getElementById('deepseekApiKey').value.trim(),
      useClaudeForVerification: document.getElementById('useClaudeForVerification').checked,
      useClaudeForMeta: document.getElementById('useClaudeForMeta').checked
    };

    // Validate at least one API key is provided
    if (!settings.claudeApiKey && !settings.geminiApiKey) {
      showStatus('Please provide at least one API key (Claude or Gemini)', 'error');
      return;
    }

    // Save to Chrome storage
    await chrome.storage.sync.set(settings);

    showStatus('✅ Settings saved successfully!', 'success');

    // Notify background script to reload API keys
    chrome.runtime.sendMessage({ type: 'RELOAD_API_KEYS' });

  } catch (error) {
    console.error('Failed to save settings:', error);
    showStatus('❌ Failed to save settings: ' + error.message, 'error');
  }
}

/**
 * Test API connectivity
 */
async function testAPIs() {
  const testBtn = document.getElementById('testBtn');
  testBtn.disabled = true;
  testBtn.textContent = '🔄 Testing...';

  const results = [];

  // Get API keys
  const claudeKey = document.getElementById('claudeApiKey').value.trim();
  const geminiKey = document.getElementById('geminiApiKey').value.trim();
  const deepseekKey = document.getElementById('deepseekApiKey').value.trim();

  // Test Claude API
  if (claudeKey && claudeKey !== 'YOUR_CLAUDE_API_KEY_HERE') {
    const claudeResult = await testClaudeAPI(claudeKey);
    results.push(`Claude: ${claudeResult}`);
  }

  // Test Gemini API
  if (geminiKey && geminiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
    const geminiResult = await testGeminiAPI(geminiKey);
    results.push(`Gemini: ${geminiResult}`);
  }

  // Test DeepSeek API
  if (deepseekKey && deepseekKey !== 'YOUR_DEEPSEEK_API_KEY_HERE') {
    const deepseekResult = await testDeepSeekAPI(deepseekKey);
    results.push(`DeepSeek: ${deepseekResult}`);
  }

  if (results.length === 0) {
    showStatus('❌ No API keys to test', 'error');
  } else {
    const allSuccess = results.every(r => r.includes('✅'));
    showStatus(results.join(' | '), allSuccess ? 'success' : 'error');
  }

  testBtn.disabled = false;
  testBtn.textContent = '🧪 Test APIs';
}

/**
 * Test Claude API
 */
async function testClaudeAPI(apiKey) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 10,
        messages: [{
          role: 'user',
          content: 'Say "test"'
        }]
      })
    });

    if (response.ok) {
      return '✅ Working';
    } else {
      const error = await response.text();
      return `❌ Error ${response.status}`;
    }
  } catch (error) {
    return '❌ Connection failed';
  }
}

/**
 * Test Gemini API
 */
async function testGeminiAPI(apiKey) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Say "test"'
            }]
          }],
          generationConfig: {
            maxOutputTokens: 10
          }
        })
      }
    );

    if (response.ok) {
      return '✅ Working';
    } else {
      return `❌ Error ${response.status}`;
    }
  } catch (error) {
    return '❌ Connection failed';
  }
}

/**
 * Test DeepSeek API
 */
async function testDeepSeekAPI(apiKey) {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{
          role: 'user',
          content: 'Say "test"'
        }],
        max_tokens: 10
      })
    });

    if (response.ok) {
      return '✅ Working';
    } else {
      return `❌ Error ${response.status}`;
    }
  } catch (error) {
    return '❌ Connection failed';
  }
}

/**
 * Show status message
 */
function showStatus(message, type) {
  const statusEl = document.getElementById('statusMessage');
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;
  
  // Auto-hide after 5 seconds for success messages
  if (type === 'success') {
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 5000);
  }
}
