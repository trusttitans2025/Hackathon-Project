// Main Application Logic
class MTS10App {
    constructor() {
        this.initialized = false;
        this.user = null;
    }

    async init() {
        try {
            // Check authentication
            await this.checkAuthentication();
            
            // Initialize components
            await this.initializeComponents();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Connect WebSocket
            this.connectRealtime();
            
            this.initialized = true;
            console.log('✅ MTS10 App initialized successfully');
            
        } catch (error) {
            console.error('❌ App initialization failed:', error);
            this.redirectToLogin();
        }
    }

    async checkAuthentication() {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            throw new Error('No authentication token');
        }

        try {
            this.user = await apiClient.getCurrentUser();
            console.log('✅ User authenticated:', this.user);
        } catch (error) {
            localStorage.removeItem('auth_token');
            throw new Error('Authentication failed');
        }
    }

    async initializeComponents() {
        // Initialize channel manager
        await channelManager.initialize();
        
        // Start periodic updates
        this.startPeriodicUpdates();
    }

    setupEventListeners() {
        // Message input handlers
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Other input handlers
        ['email-input', 'social-input', 'web-response'].forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (inputId === 'email-input') this.sendEmail();
                        else if (inputId === 'social-input') this.sendSocialReply();
                        else if (inputId === 'web-response') this.sendWebResponse();
                    }
                });
            }
        });

        // WebSocket event handlers
        window.addEventListener('newMessage', (event) => {
            this.showNotification('New message received');
        });

        window.addEventListener('notification', (event) => {
            this.showNotification(event.detail.message);
        });
    }

    connectRealtime() {
        try {
            apiClient.connectWebSocket();
        } catch (error) {
            console.error('WebSocket connection failed:', error);
        }
    }

    async sendMessage() {
        const input = document.getElementById('message-input');
        const text = input.value.trim();
        
        if (!text) return;

        try {
            // Add message to conversation immediately for better UX
            if (!channelManager.conversations[channelManager.currentChannel]) {
                channelManager.conversations[channelManager.currentChannel] = [];
            }
            
            channelManager.conversations[channelManager.currentChannel].push({
                sender: 'agent',
                text: text,
                timestamp: new Date()
            });

            // Clear input and re-render
            input.value = '';
            channelManager.renderConversation();
            
            // Analyze conversation
            await channelManager.analyzeConversation();
            
            // Send to server (in real app)
            // await apiClient.sendMessage('conv_123', text, channelManager.currentChannel);
            
        } catch (error) {
            console.error('Send message failed:', error);
            this.showNotification('Failed to send message', 'error');
        }
    }

    async sendEmail() {
        const input = document.getElementById('email-input');
        const text = input.value.trim();
        
        if (!text) return;

        try {
            console.log('📧 Email sent:', text);
            input.value = '';
            this.showNotification('Email sent successfully', 'success');
        } catch (error) {
            console.error('Send email failed:', error);
            this.showNotification('Failed to send email', 'error');
        }
    }

    async sendSocialReply() {
        const input = document.getElementById('social-input');
        const text = input.value.trim();
        
        if (!text) return;

        try {
            console.log('📱 Social reply sent:', text);
            input.value = '';
            this.showNotification('Social reply posted', 'success');
        } catch (error) {
            console.error('Send social reply failed:', error);
            this.showNotification('Failed to post reply', 'error');
        }
    }

    async sendWebResponse() {
        const input = document.getElementById('web-response');
        const text = input.value.trim();
        
        if (!text) return;

        try {
            console.log('🌐 Web response sent:', text);
            input.value = '';
            this.showNotification('Response sent successfully', 'success');
        } catch (error) {
            console.error('Send web response failed:', error);
            this.showNotification('Failed to send response', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${this.getNotificationClass(type)}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    getNotificationClass(type) {
        switch (type) {
            case 'success': return 'bg-green-500 text-white';
            case 'error': return 'bg-red-500 text-white';
            case 'warning': return 'bg-yellow-500 text-white';
            default: return 'bg-blue-500 text-white';
        }
    }

    startPeriodicUpdates() {
        // Simulate real-time notification updates
        setInterval(() => {
            if (Math.random() > 0.8) {
                const channels = ['chat', 'email', 'social', 'web'];
                const randomChannel = channels[Math.floor(Math.random() * channels.length)];
                
                if (randomChannel !== channelManager.currentChannel) {
                    const badge = document.getElementById(`badge-${randomChannel}`);
                    if (badge) {
                        const currentCount = parseInt(badge.textContent) || 0;
                        channelManager.updateNotificationBadge(randomChannel, currentCount + 1);
                    }
                }
            }
        }, 10000); // Every 10 seconds
    }

    redirectToLogin() {
        window.location.href = '/login.html';
    }
}

// Global Functions (for HTML onclick handlers)
function switchChannel(channelId) {
    channelManager.switchChannel(channelId);
}

function sendMessage() {
    app.sendMessage();
}

function sendEmail() {
    app.sendEmail();
}

function sendSocialReply() {
    app.sendSocialReply();
}

function sendWebResponse() {
    app.sendWebResponse();
}

function logout() {
    apiClient.logout();
    window.location.href = '/login.html';
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new MTS10App();
    app.init();
});