// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    testGeminiAPI();
});

// Global variables
let currentTemplate = null;
let resumeData = {
    personal: {
        fullName: '',
        jobTitle: '',
        email: '',
        phone: '',
        location: '',
        summary: ''
    },
    experience: [],
    education: [],
    skills: []
};

// Add loading state management
let isLoading = false;

function setLoading(loading) {
    isLoading = loading;
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    if (loading) {
        if (!loadingOverlay) {
            const overlay = document.createElement('div');
            overlay.id = 'loadingOverlay';
            overlay.style.display = 'flex'; // Set display here directly
            overlay.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Please wait...</p>
                </div>
            `;
            document.body.appendChild(overlay);
        } else {
            loadingOverlay.style.display = 'flex';
        }
    } else if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Initialize dashboard
function initializeDashboard() {
    setupNavigation();
    setupTemplateFilters();
    setupBuilderSections();
    loadResumeData();
    setupAIChat();
    updateDashboardStats();
}

// Navigation between sections
function setupNavigation() {
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
            
            // Update active nav item
            document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// Template functionality
function setupTemplateFilters() {
    document.querySelectorAll('.template-filters .btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            filterTemplates(filter);
            
            // Update active filter
            document.querySelectorAll('.template-filters .btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function filterTemplates(filter) {
    document.querySelectorAll('.template-card-large').forEach(card => {
        const template = card.getAttribute('data-template');
        if (filter === 'all' || template.includes(filter)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function selectTemplate(templateId) {
    currentTemplate = templateId;
    showSection('builder');
    
    // Update sidebar navigation
    document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector('[data-section="builder"]').classList.add('active');
    
    // Apply template styles to preview
    applyTemplateStyles(templateId);
    
    // Save template selection
    localStorage.setItem('selectedTemplate', templateId);
    
    showNotification('Template selected successfully!', 'success');
}

// Apply template styles to the resume preview
function applyTemplateStyles(templateId) {
    const resumePreview = document.getElementById('resumePreview');
    if (!resumePreview) return;
    
    // Remove all template classes
    resumePreview.classList.remove('template-modern', 'template-classic', 'template-creative');
    
    // Add the selected template class
    resumePreview.classList.add(`template-${templateId}`);
    
    // Apply template-specific styles
    const templateStyles = {
        'modern-pro': {
            fontFamily: "'Roboto', sans-serif",
            color: '#2c3e50',
            backgroundColor: '#ffffff',
            accentColor: '#3498db'
        },
        'classic-exec': {
            fontFamily: "'Times New Roman', serif",
            color: '#000000',
            backgroundColor: '#ffffff',
            accentColor: '#2c3e50'
        },
        'creative-port': {
            fontFamily: "'Poppins', sans-serif",
            color: '#1a1a1a',
            backgroundColor: '#f8f9fa',
            accentColor: '#e74c3c'
        }
    };
    
    const style = templateStyles[templateId] || templateStyles['modern-pro'];
    
    // Apply styles to resume preview
    resumePreview.style.fontFamily = style.fontFamily;
    resumePreview.style.color = style.color;
    resumePreview.style.backgroundColor = style.backgroundColor;
    
    // Update CSS variables for accent colors
    document.documentElement.style.setProperty('--accent-primary', style.accentColor);
    document.documentElement.style.setProperty('--accent-secondary', style.accentColor + '80');
}

// Builder functionality
function setupBuilderSections() {
    document.querySelectorAll('.builder-section').forEach(section => {
        section.addEventListener('click', function() {
            const sectionName = this.getAttribute('data-section');
            showBuilderSection(sectionName);
            
            // Update active section
            document.querySelectorAll('.builder-section').forEach(s => s.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Setup contenteditable listeners
    setupContentEditableListeners();
}

function showBuilderSection(sectionName) {
    // This would show different form sections for editing
    // First, remove highlight from all sections
    const preview = document.getElementById('resumePreview');
    preview.querySelectorAll('.resume-section').forEach(section => {
        section.classList.remove('highlight');
    });
    
    // Add highlight to relevant section
    const targetSection = preview.querySelector(`[data-section="${sectionName}"]`);
    if (targetSection) {
        targetSection.classList.add('highlight');
    }
    
    // Show the corresponding section in the builder
    document.querySelectorAll('.builder-content > div').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show the selected section
    const builderContent = document.querySelector(`.builder-content > div[data-section="${sectionName}"]`);
    if (builderContent) {
        builderContent.style.display = 'block';
    }
}

// Setup content editable listeners
function setupContentEditableListeners() {
    const editableElements = document.querySelectorAll('[contenteditable="true"]');
    
    editableElements.forEach(element => {
        // Focus event - add editing class
        element.addEventListener('focus', function() {
            this.classList.add('editing');
            if (!this.previousElementSibling?.classList.contains('formatting-toolbar')) {
                makeContentEditable(this);
            }
        });
        
        // Blur event - remove editing class and save data
        element.addEventListener('blur', function() {
            this.classList.remove('editing');
            saveResumeData();
        });
        
        // Input event - save data as user types
        element.addEventListener('input', function() {
            saveResumeData();
        });
    });
    
    // Setup skill tag listeners
    const skillsContainer = document.getElementById('skillsContainer');
    if (skillsContainer) {
        // Add new skill when Enter is pressed in the input
        const skillInput = document.getElementById('skillInput');
        if (skillInput) {
            skillInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const skillText = this.value.trim();
                    if (skillText) {
                        addSkill(skillText);
                        this.value = '';
                        saveResumeData();
                    }
                }
            });
        }
        
        // Add skill button
        const addSkillBtn = document.getElementById('addSkillBtn');
        if (addSkillBtn) {
            addSkillBtn.addEventListener('click', function() {
                const skillInput = document.getElementById('skillInput');
                const skillText = skillInput.value.trim();
                if (skillText) {
                    addSkill(skillText);
                    skillInput.value = '';
                    saveResumeData();
                }
            });
        }
    }
}

// Add a new skill tag
function addSkill(skillText) {
    const skillsContainer = document.getElementById('skillsContainer');
    const skillTag = document.createElement('span');
    skillTag.className = 'skill-tag';
    skillTag.textContent = skillText;
    
    // Add delete button
    const deleteBtn = document.createElement('span');
    deleteBtn.className = 'skill-delete';
    deleteBtn.innerHTML = '&times;';
    deleteBtn.addEventListener('click', function() {
        skillTag.remove();
        saveResumeData();
    });
    
    skillTag.appendChild(deleteBtn);
    skillsContainer.appendChild(skillTag);
}

// Resume data management
function saveResumeData() {
    try {
    // Get all data from the DOM
        const personalInfo = {
            fullName: document.getElementById('fullName')?.textContent?.trim() || '',
            jobTitle: document.getElementById('jobTitle')?.textContent?.trim() || '',
            email: document.getElementById('email')?.textContent?.trim() || '',
            phone: document.getElementById('phone')?.textContent?.trim() || '',
            location: document.getElementById('location')?.textContent?.trim() || '',
            summary: document.getElementById('summary')?.textContent?.trim() || ''
    };
    
    // Get experience items
        const experienceItems = [];
        document.querySelectorAll('.experience-item').forEach(item => {
            const jobTitle = item.querySelector('.job-title')?.textContent?.trim() || '';
            const company = item.querySelector('.company')?.textContent?.trim() || '';
            const dates = item.querySelector('.dates')?.textContent?.trim() || '';
            const description = item.querySelector('.description')?.textContent?.trim() || '';
            
            if (jobTitle || company) {
                experienceItems.push({ jobTitle, company, dates, description });
            }
    });
    
    // Get education items
        const educationItems = [];
        document.querySelectorAll('.education-item').forEach(item => {
            const degree = item.querySelector('.degree')?.textContent?.trim() || '';
            const university = item.querySelector('.university')?.textContent?.trim() || '';
            const year = item.querySelector('.year')?.textContent?.trim() || '';
            
            if (degree || university) {
                educationItems.push({ degree, university, year });
            }
    });
    
    // Get skills
        const skills = [];
        document.querySelectorAll('.skill-tag').forEach(tag => {
        const skillText = tag.textContent.replace('×', '').trim();
            if (skillText) {
                skills.push(skillText);
            }
    });
        
        // Update resume data
        resumeData = {
            personal: personalInfo,
            experience: experienceItems,
            education: educationItems,
            skills: skills,
            template: currentTemplate
        };
    
    // Save to local storage
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
        console.log('Resume data saved successfully:', resumeData);
        showNotification('Resume saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving resume data:', error);
        showNotification('Error saving resume data. Please try again.', 'error');
    }
}

function loadResumeData() {
    try {
    const savedData = localStorage.getItem('resumeData');
    if (savedData) {
        resumeData = JSON.parse(savedData);
            console.log('Loaded resume data:', resumeData);
    
            // Load the previously selected template first
            if (resumeData.template) {
                selectTemplate(resumeData.template);
            }
            
            // Then populate the resume preview
            populateResumePreview();
        } else {
            console.log('No saved resume data found, initializing with defaults');
            initializeDefaultResume();
        }
    } catch (error) {
        console.error('Error loading resume data:', error);
        showNotification('Error loading saved resume data. Starting with a fresh resume.', 'error');
        initializeDefaultResume();
    }
}

function initializeDefaultResume() {
    resumeData = {
        personal: {
            fullName: 'Your Name',
            jobTitle: 'Job Title',
            email: 'email@example.com',
            phone: '(555) 123-4567',
            location: 'City, State',
            summary: 'Write a compelling professional summary...'
        },
        experience: [{
            jobTitle: 'Job Title',
            company: 'Company Name',
            dates: '2020 - Present',
            description: 'Achievement or responsibility description'
        }],
        education: [{
            degree: 'Degree Name',
            university: 'University Name',
            year: 'Year'
        }],
        skills: ['JavaScript', 'Python', 'React', 'Node.js']
    };
    populateResumePreview();
}

function populateResumePreview() {
    if (!resumeData) {
        console.error('No resume data available');
        return;
    }
    
    try {
    // Populate personal information
        const personal = resumeData.personal || {};
        const elements = {
            'fullName': personal.fullName || 'Your Name',
            'jobTitle': personal.jobTitle || 'Job Title',
            'email': personal.email || 'email@example.com',
            'phone': personal.phone || '(555) 123-4567',
            'location': personal.location || 'City, State',
            'summary': personal.summary || 'Write a compelling professional summary...'
        };
        
        // Update each element
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            } else {
                console.warn(`Element with id ${id} not found`);
            }
        });
        
        // Populate experience
        const experienceContainer = Array.from(document.querySelectorAll('resume-section')).find(section => {
            const heading = section.querySelector('h4');
            return heading && heading.textContent.includes('Work Experience');
        });
        if (experienceContainer) {
            const experienceList = experienceContainer.querySelector('.experience-list') || experienceContainer;
            experienceList.innerHTML = '';
            
            if (resumeData.experience && resumeData.experience.length > 0) {
                resumeData.experience.forEach(exp => {
                    const expItem = document.createElement('div');
                    expItem.className = 'experience-item';
                    expItem.innerHTML = `
                        <div class="d-flex justify-content-between">
                            <h5 class="job-title" contenteditable="true">${exp.jobTitle || ''}</h5>
                            <span class="dates" contenteditable="true">${exp.dates || ''}</span>
                        </div>
                        <h6 class="company" contenteditable="true">${exp.company || ''}</h6>
                        <div class="description" contenteditable="true">${exp.description || ''}</div>
                    `;
                    experienceList.appendChild(expItem);
                });
            } else {
                addDefaultExperience(experienceList);
            }
        }
        
        // Populate education
        const educationContainer = document.querySelector('.resume-section:has(h4:contains("Education"))');
        if (educationContainer) {
            const educationList = educationContainer.querySelector('.education-list') || educationContainer;
            educationList.innerHTML = '';
            
            if (resumeData.education && resumeData.education.length > 0) {
                resumeData.education.forEach(edu => {
                    const eduItem = document.createElement('div');
                    eduItem.className = 'education-item';
                    eduItem.innerHTML = `
                        <div class="d-flex justify-content-between">
                            <h5 class="degree" contenteditable="true">${edu.degree || ''}</h5>
                            <span class="year" contenteditable="true">${edu.year || ''}</span>
                        </div>
                        <h6 class="university" contenteditable="true">${edu.university || ''}</h6>
                    `;
                    educationList.appendChild(eduItem);
                });
            } else {
                addDefaultEducation(educationList);
            }
        }
        
        // Populate skills
        const skillsContainer = document.querySelector('.skills-list');
        if (skillsContainer) {
            skillsContainer.innerHTML = '';
            
            if (resumeData.skills && resumeData.skills.length > 0) {
                resumeData.skills.forEach(skill => {
                    addSkill(skill);
                });
            } else {
                addDefaultSkills(skillsContainer);
    }
        }
        
        // Setup content editable listeners again
        setupContentEditableListeners();
        
        console.log('Resume preview populated successfully');
    } catch (error) {
        console.error('Error populating resume preview:', error);
        showNotification('Error populating resume preview. Please try refreshing the page.', 'error');
    }
}

function addDefaultExperience(container) {
    const defaultExp = document.createElement('div');
    defaultExp.className = 'experience-item';
    defaultExp.innerHTML = `
        <div class="d-flex justify-content-between">
            <h5 class="job-title" contenteditable="true">Job Title</h5>
            <span class="dates" contenteditable="true">2020 - Present</span>
        </div>
        <h6 class="company" contenteditable="true">Company Name</h6>
        <ul>
            <li contenteditable="true">Achievement or responsibility description</li>
            <li contenteditable="true">Another achievement with quantifiable results</li>
        </ul>
    `;
    container.appendChild(defaultExp);
}

function addDefaultEducation(container) {
    const defaultEdu = document.createElement('div');
    defaultEdu.className = 'education-item';
    defaultEdu.innerHTML = `
        <div class="d-flex justify-content-between">
            <h5 class="degree" contenteditable="true">Degree Name</h5>
            <span class="year" contenteditable="true">Year</span>
        </div>
        <h6 class="university" contenteditable="true">University Name</h6>
    `;
    container.appendChild(defaultEdu);
}

function addDefaultSkills(container) {
    const defaultSkills = ['JavaScript', 'Python', 'React', 'Node.js'];
    defaultSkills.forEach(skill => {
        addSkill(skill);
    });
}

function saveResume() {
    saveResumeData();
    showNotification('Resume saved successfully!', 'success');
}

function downloadResume() {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    const resumeContent = document.getElementById('resumePreview').innerHTML;
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Resume</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link href="styles.css" rel="stylesheet">
            <style>
                body { background: white !important; }
                .resume-preview { transform: none !important; box-shadow: none !important; }
                .resume-page { color: #333 !important; }
                @media print {
                    body { margin: 0; }
                    .resume-page { padding: 0.5in; }
                }
            </style>
        </head>
        <body>
            <div class="resume-preview">
                ${resumeContent}
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    window.close();
                }
            </script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    // Increment download count
    incrementDownloadCount();
    
    showNotification('Resume download initiated!', 'success');
}

// AI Assistant functionality
function setupAIChat() {
    const chatInput = document.getElementById('aiChatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendAIMessage();
            }
        });
    }
}

// Send message to AI chat
async function sendAIMessage(message = null) {
    if (isLoading) return;
    
    try {
        setLoading(true);
        
    // If no message is provided, get it from the input field
    if (!message) {
        const aiChatInput = document.getElementById('aiChatInput');
        message = aiChatInput.value.trim();
        
        if (!message) return; // Don't send empty messages
        
        // Clear the input field
        aiChatInput.value = '';
    }
    
    // Add user message to chat
    addMessageToChat('user', message);
    
    // Show loading indicator
    const loadingMessage = addMessageToChat('assistant', '<div class="typing-indicator"><span></span><span></span><span></span></div>');
    
    // Increment AI suggestion count
    incrementAISuggestionCount();
    
    // Generate AI response
        const response = await generateAIResponse(message);
        
            // Replace loading indicator with actual response
            loadingMessage.innerHTML = response;
        
    } catch (error) {
        console.error('Error in AI chat:', error);
        showNotification('Error generating AI response. Please try again.', 'error');
    } finally {
        setLoading(false);
    }
}

function addMessageToChat(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'ai' ? 'ai-message' : 'user-message';
    
    if (sender === 'ai') {
        // Replace newline characters with <br> tags for proper display of multi-line AI responses
        const formattedMessage = message.replace(/\n/g, '<br>');
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <p>${formattedMessage}</p>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-content user-message-content">
                <p>${message}</p>
            </div>
            <div class="message-avatar user-avatar">
                <i class="fas fa-user"></i>
            </div>
        `;
        messageDiv.style.flexDirection = 'row-reverse';
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function generateAIResponse(userMessage) {
    return new Promise((resolve, reject) => {
        // Extract keywords from user message for better context
        const keywords = userMessage.toLowerCase().split(' ');
        let context = 'resume writing';
        
        // Check for specific topics in the message
        if (keywords.some(word => ['job', 'position', 'career', 'work'].includes(word))) {
            context = 'job search';
        } else if (keywords.some(word => ['skill', 'skills', 'ability', 'abilities'].includes(word))) {
            context = 'resume skills';
        } else if (keywords.some(word => ['education', 'degree', 'university', 'college'].includes(word))) {
            context = 'education section';
        } else if (keywords.some(word => ['experience', 'work', 'job', 'employment'].includes(word))) {
            context = 'work experience';
        } else if (keywords.some(word => ['summary', 'profile', 'objective', 'about'].includes(word))) {
            context = 'resume summary';
        }
        
        // Use the Gemini AI to generate a response
        geminiAI.generateText(`As a resume writing assistant, provide advice about ${context} based on this query: ${userMessage}`)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                console.error('Error generating AI response:', error);
                reject('Sorry, I encountered an error while generating a response. Please try again.');
            });
    });
}

// AI-powered content generation
async function generateContent() {
    try {
        setLoading(true);
    showNotification('Generating AI content...', 'info');
    
    // Get job title for context
    const jobTitle = document.getElementById('jobTitle').textContent.trim() || 'Professional';
    
        // Create prompt for Gemini AI with specific length and format requirements
        const prompt = `Generate a concise professional summary for a ${jobTitle} resume. Follow these guidelines:
        1. Keep it between 3-4 sentences
        2. Focus on key achievements and skills
        3. Use strong action verbs
        4. Include quantifiable results
        5. Make it ATS-friendly
        6. Keep it professional and impactful
        
        Format the response as plain text without any special formatting.`;
    
    // Use Gemini AI to generate content
        const response = await geminiAI.generateText(prompt);
        
            // Update summary with AI-generated content
        const summaryElement = document.getElementById('summary');
        if (summaryElement) {
            summaryElement.innerHTML = response;
            // Make it editable with formatting
            makeContentEditable(summaryElement);
        }
            
            // Save the updated resume data
            saveResumeData();
            
            // Increment AI suggestion count
            incrementAISuggestionCount();
            
            showNotification('AI content generated successfully!', 'success');
    } catch (error) {
            console.error('Error generating content:', error);
            showNotification('Error generating content. Please try again.', 'error');
    } finally {
        setLoading(false);
    }
}

// Function to make content editable with formatting
function makeContentEditable(element) {
    if (!element) return;
    
    element.contentEditable = true;
    element.spellcheck = true;
    
    // Add formatting toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'formatting-toolbar';
    toolbar.innerHTML = `
        <button class="btn btn-sm btn-light" onclick="formatText('bold')"><i class="fas fa-bold"></i></button>
        <button class="btn btn-sm btn-light" onclick="formatText('italic')"><i class="fas fa-italic"></i></button>
        <button class="btn btn-sm btn-light" onclick="formatText('underline')"><i class="fas fa-underline"></i></button>
        <button class="btn btn-sm btn-light" onclick="formatText('bullet')"><i class="fas fa-list-ul"></i></button>
    `;
    
    // Insert toolbar before the element
    element.parentNode.insertBefore(toolbar, element);
    
    // Add event listeners for formatting
    element.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            document.execCommand('insertLineBreak');
        }
    });
}

// Function to format text
function formatText(command) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    if (!selectedText) return;
    
    switch (command) {
        case 'bold':
            document.execCommand('bold', false, null);
            break;
        case 'italic':
            document.execCommand('italic', false, null);
            break;
        case 'underline':
            document.execCommand('underline', false, null);
            break;
        case 'bullet':
            document.execCommand('insertUnorderedList', false, null);
            break;
    }
}

// Add formatting toolbar styles
const formattingStyles = document.createElement('style');
formattingStyles.textContent = `
    .formatting-toolbar {
        margin-bottom: 8px;
        padding: 4px;
        background: #f8f9fa;
        border-radius: 4px;
        display: flex;
        gap: 4px;
    }
    
    .formatting-toolbar button {
        padding: 2px 8px;
        font-size: 12px;
    }
    
    .formatting-toolbar button:hover {
        background: #e9ecef;
    }
    
    [contenteditable="true"] {
        padding: 8px;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        min-height: 0px;
    }
    
    [contenteditable="true"]:focus {
        outline: none;
        border-color: #80bdff;
        box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
    }
`;
document.head.appendChild(formattingStyles);

// Function to get job-specific resume suggestions
async function getJobSpecificSuggestions() {
    const jobTitle = document.getElementById('jobTitle').textContent.trim();
    
    if (!jobTitle || jobTitle === 'Job Title') {
        showNotification('Please enter a job title first', 'info');
        return;
    }
    
    try {
        setLoading(true);
        showNotification(`Getting suggestions for ${jobTitle} role...`, 'info');
        
        // Increment AI suggestion count
        incrementAISuggestionCount();
        
        // Create prompt for Gemini AI
        const prompt = `As a professional career coach, provide 3-4 specific, actionable, and concise tips for optimizing a resume for a ${jobTitle} position. Each tip should be concise and to the point around 50 words. Include industry-specific keywords, skills, and formatting advice. Format the response as simple bullet points (e.g., using '-' or '*' for each point).`;
        
        // Use Gemini AI to generate suggestions
        const response = await geminiAI.generateText(prompt);
        
        // Show the suggestions in the chat
        addMessageToChat(`Here are my suggestions for your ${jobTitle} resume:\n\n${response}`, 'ai');
        
        // Show AI Assistant section
        showSection('ai-assistant');
        showNotification('Job-specific suggestions ready!', 'success');
    } catch (error) {
        console.error('Error getting job suggestions:', error);
        showNotification('Error getting job suggestions. Please try again.', 'error');
    } finally {
        setLoading(false);
    }
}

// Function to analyze resume and provide detailed feedback
async function analyzeResume() {
    try {
        setLoading(true);
        showNotification('Analyzing your resume...', 'info');
        
        // Make sure we have the latest data
        saveResumeData();
        
        // Increment AI suggestion count
        incrementAISuggestionCount();
        
        // Create a detailed prompt for analysis
        const prompt = `As a professional resume reviewer, analyze this resume and provide specific feedback for improvement around 50 words. Focus on:
        1. Content quality and impact
        2. Skills presentation
        3. Experience descriptions
        4. Education section
        5. Overall formatting and structure
        
        Resume Data:
        ${JSON.stringify(resumeData, null, 2)}`;
        
        // Use Gemini AI to analyze the resume
        const response = await geminiAI.generateText(prompt);
        
        // Show the analysis in the chat
        addMessageToChat(`# Resume Analysis\n\n${response}`, 'ai');
        
        // Show AI Assistant section
        showSection('ai-assistant');
        showNotification('Resume analysis complete!', 'success');
    } catch (error) {
        console.error('Error analyzing resume:', error);
        showNotification('Error analyzing resume. Please try again.', 'error');
    } finally {
        setLoading(false);
    }
}

// Function to get keyword suggestions for a job title
async function getKeywordSuggestions() {
    const jobTitle = document.getElementById('jobTitle').textContent.trim();
    
    if (!jobTitle || jobTitle === 'Job Title') {
        showNotification('Please enter a job title first', 'info');
        return;
    }
    
    try {
        setLoading(true);
        // Prompt for industry (optional)
        const industry = prompt('Enter the industry (optional):', '');
        
        showNotification(`Getting keyword suggestions for ${jobTitle}${industry ? ' in ' + industry : ''}...`, 'info');
        
        // Increment AI suggestion count
        incrementAISuggestionCount();
        
        // Create a detailed prompt for keyword suggestions
        const prompt = `As a professional resume writer, extract and suggest important keywords and skills for a ${jobTitle} position${industry ? ' in the ' + industry + ' industry' : ''}. Include:
        1. Technical skills
        2. Soft skills
        3. Industry-specific terms
        4. Action verbs
        5. Certifications or qualifications
        
        Format the response in clear categories with bullet points and give the ans in 50 words.`;
        
        // Use Gemini AI to get keyword suggestions
        const response = await geminiAI.generateText(prompt);
        
        // Show the suggestions in the chat
        addMessageToChat(`# Recommended Keywords for ${jobTitle}${industry ? ' in ' + industry : ''}\n\n${response}`, 'ai');
        
        // Show AI Assistant section
        showSection('ai-assistant');
        showNotification('Keyword suggestions ready!', 'success');
    } catch (error) {
        console.error('Error getting keyword suggestions:', error);
        showNotification('Error getting keyword suggestions. Please try again.', 'error');
    } finally {
        setLoading(false);
    }
}

// Function to optimize resume with AI
async function optimizeResume() {
    try {
        setLoading(true);
        // Show loading indicator
        const loadingMessage = addMessageToChat('assistant', '<div class="typing-indicator"><span></span><span></span><span></span></div>');
        
        // Get job description if available
        const jobDescription = document.getElementById('jobDescription')?.value || '';
        
        // Get current section content
        const currentSection = document.querySelector('.builder-section.active');
        let contentToOptimize = '';
        
        // Increment AI suggestion count
        incrementAISuggestionCount();
        
        if (currentSection) {
            const sectionId = currentSection.getAttribute('data-section');
            
            switch(sectionId) {
                case 'personal':
                    contentToOptimize = document.getElementById('summary').textContent;
                    break;
                case 'experience':
                    // Get the first experience item or the active one
                    const expItem = document.querySelector('.experience-item.active') || document.querySelector('.experience-item');
                    if (expItem) {
                        contentToOptimize = expItem.querySelector('.description').textContent;
                    }
                    break;
                case 'education':
                    // For education, we'll optimize the degree and university
                    const eduItem = document.querySelector('.education-item.active') || document.querySelector('.education-item');
                    if (eduItem) {
                        const degree = eduItem.querySelector('.degree').textContent;
                        const university = eduItem.querySelector('.university').textContent;
                        contentToOptimize = `${degree} at ${university}`;
                    }
                    break;
                case 'skills':
                    // For skills, we'll get suggestions based on job description
                    contentToOptimize = resumeData.skills.join(', ');
                    break;
            }
        }
        
        if (!contentToOptimize) {
            loadingMessage.innerHTML = 'Please select a section with content to optimize.';
            return;
        }
        
        // Create a detailed prompt for optimization
        const prompt = `As a professional resume writer, optimize the following content to be more impactful and professional. Focus on:
        1. Using strong action verbs
        2. Quantifying achievements
        3. Highlighting relevant skills
        4. Improving clarity and conciseness
        5. Making it ATS-friendly
        
        ${jobDescription ? `Job Description: ${jobDescription}\n\n` : ''}Content to optimize:\n${contentToOptimize}`;
        
        // Use AI to optimize the content
        const optimizedContent = await geminiAI.generateText(prompt);
        
        // Update the loading message with the optimized content
        loadingMessage.innerHTML = `<strong>Optimized Content:</strong><br>${optimizedContent}`;
        
        // Add a button to apply the optimized content
        const applyButton = document.createElement('button');
        applyButton.className = 'btn btn-sm btn-primary mt-2';
        applyButton.textContent = 'Apply Changes';
        applyButton.onclick = function() {
            applyOptimizedContent(optimizedContent, currentSection);
        };
        
        loadingMessage.appendChild(document.createElement('br'));
        loadingMessage.appendChild(applyButton);
        
        showNotification('Content optimization complete!', 'success');
    } catch (error) {
        console.error('Error optimizing content:', error);
        showNotification('Error optimizing content. Please try again.', 'error');
    } finally {
        setLoading(false);
    }
}

// Apply optimized content to the appropriate section
function applyOptimizedContent(content, section) {
    if (!section) return;
    
    const sectionId = section.getAttribute('data-section');
    
    switch(sectionId) {
        case 'personal':
            document.getElementById('summary').textContent = content;
            break;
        case 'experience':
            const expItem = document.querySelector('.experience-item.active') || document.querySelector('.experience-item');
            if (expItem) {
                expItem.querySelector('.description').textContent = content;
            }
            break;
        case 'education':
            // For education, we need to parse the optimized content
            const eduItem = document.querySelector('.education-item.active') || document.querySelector('.education-item');
            if (eduItem) {
                // Try to extract degree and university
                const parts = content.split(' at ');
                if (parts.length >= 2) {
                    eduItem.querySelector('.degree').textContent = parts[0];
                    eduItem.querySelector('.university').textContent = parts[1];
                } else {
                    // If we can't parse it, just update the degree
                    eduItem.querySelector('.degree').textContent = content;
                }
            }
            break;
        case 'skills':
            // For skills, replace all skills with the new ones
            const skillsContainer = document.getElementById('skillsContainer');
            if (skillsContainer) {
                // Clear existing skills
                skillsContainer.innerHTML = '';
                
                // Add new skills
                const skills = content.split(',').map(skill => skill.trim());
                skills.forEach(skill => {
                    if (skill) addSkill(skill);
                });
            }
            break;
    }
    
    // Save the updated resume data
    saveResumeData();
    
    // Show notification
    showNotification('Content updated successfully!', 'success');
}

// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} notification`;
    
    // Set icon based on type
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
    
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
            <button type="button" class="btn-close" onclick="this.closest('.notification').remove()"></button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('removing');
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Update notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 400px;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.3s ease;
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
    }
    
    .notification.removing {
        animation: slideOutRight 0.3s ease forwards;
    }
    
    .notification .d-flex {
        align-items: center;
    }
    
    .notification i {
        font-size: 1.2rem;
        margin-right: 0.5rem;
    }
    
    .notification .btn-close {
        padding: 0.5rem;
        margin-left: auto;
        opacity: 0.5;
        transition: opacity 0.2s ease;
    }
    
    .notification .btn-close:hover {
        opacity: 1;
    }
    
    #loadingOverlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    }
    
    .loading-spinner {
        background: var(--bg-primary);
        padding: 2rem;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .loading-spinner p {
        margin: 0;
        color: var(--text-primary);
    }
    
    .typing-indicator {
        display: flex;
        align-items: center;
        gap: 4px;
    }
    
    .typing-indicator span {
        width: 8px;
        height: 8px;
        background: var(--accent-primary);
        border-radius: 50%;
        animation: typingBounce 1s infinite;
    }
    
    .typing-indicator span:nth-child(2) {
        animation-delay: 0.2s;
    }
    
    .typing-indicator span:nth-child(3) {
        animation-delay: 0.4s;
    }
    
    @keyframes typingBounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
    }
`;
document.head.appendChild(notificationStyles);

// GeminiAI class for handling AI interactions
class GeminiAI {
    constructor(apiKey) {
        this.apiKey = apiKey || '';
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        this.isKeyValid = false;
        this.validateApiKey();
    }
    
    async validateApiKey() {
        if (!this.apiKey) {
            console.error('No API key provided');
            showNotification('Please provide a valid Gemini API key', 'error');
            return false;
        }

        try {
            // First, check if the API key format is valid
            if (!this.apiKey.match(/^AIza[a-zA-Z0-9_-]{35}$/)) {
                console.error('Invalid API key format');
                showNotification('Invalid API key format. Please check your key.', 'error');
                return false;
            }

            const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: 'Hello'
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.1,
                        topK: 1,
                        topP: 1,
                        maxOutputTokens: 1,
                    }
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.isKeyValid = true;
                console.log('Gemini API key validated successfully');
                return true;
            } else {
                console.error('API key validation failed:', data);
                
                // Handle specific error cases
                if (data.error) {
                    switch(data.error.status) {
                        case 'INVALID_ARGUMENT':
                            showNotification('Invalid API key format. Please check your key.', 'error');
                            break;
                        case 'PERMISSION_DENIED':
                            showNotification('API key is not authorized. Please check your key.', 'error');
                            break;
                        case 'RESOURCE_EXHAUSTED':
                            showNotification('API quota exceeded. Please try again later.', 'error');
                            break;
                        default:
                            showNotification(`API Error: ${data.error.message || 'Unknown error'}`, 'error');
                    }
                } else {
                    showNotification('Error validating API key. Please try again.', 'error');
                }
                return false;
            }
        } catch (error) {
            console.error('Error validating Gemini API key:', error);
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                showNotification('Network error. Please check your internet connection.', 'error');
            } else {
                showNotification('Error connecting to Gemini API. Please try again.', 'error');
            }
            return false;
        }
    }
    
    async generateText(prompt, systemPrompt = '') {
        if (!this.isKeyValid) {
            const isValid = await this.validateApiKey();
            if (!isValid) {
                throw new Error('Invalid API key');
            }
        }
        
        try {
            const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                console.error('API Error:', data);
                
                if (data.error) {
                    switch(data.error.status) {
                        case 'INVALID_ARGUMENT':
                            throw new Error('Invalid request format');
                        case 'PERMISSION_DENIED':
                            throw new Error('API key is not authorized');
                        case 'RESOURCE_EXHAUSTED':
                            throw new Error('API quota exceeded');
                        default:
                            throw new Error(data.error.message || 'API request failed');
                    }
                } else {
                    throw new Error('API request failed');
                }
            }
            
            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Invalid response format from Gemini API');
            }
        } catch (error) {
            console.error('Error generating text:', error);
            throw error;
        }
    }
    
    async optimizeContent(content, jobDescription = '') {
        const systemPrompt = 'You are a professional resume writer. Optimize the following content to be more impactful and professional.';
        const prompt = `${jobDescription ? `Job Description: ${jobDescription}\n\n` : ''}Content to optimize:\n${content}`;
        return this.generateText(prompt, systemPrompt);
    }
    
    async analyzeResume(resumeData) {
        const systemPrompt = 'You are a professional resume reviewer. Analyze this resume and provide specific feedback for improvement.';
        const prompt = `Resume Data:\n${JSON.stringify(resumeData, null, 2)}`;
        return this.generateText(prompt, systemPrompt);
    }
    
    async getKeywordSuggestions(jobDescription) {
        const systemPrompt = 'You are a professional resume writer. Extract and suggest important keywords and skills from the job description.';
        return this.generateText(jobDescription, systemPrompt);
    }
    
    async getJobSpecificSuggestions(resumeData, jobDescription) {
        const systemPrompt = 'You are a professional career coach. Provide specific suggestions to tailor this resume for the given job.';
        const prompt = `Resume Data:\n${JSON.stringify(resumeData, null, 2)}\n\nJob Description:\n${jobDescription}`;
        return this.generateText(prompt, systemPrompt);
    }
}

// Initialize Gemini AI with API key
let geminiApiKey = 'AIzaSyAQa7gRxxIjU6C4PMPs8R159Z_6kN00C94';

// Create Gemini AI instance and make it globally accessible
window.geminiAI = new GeminiAI(geminiApiKey);

// Test function to verify API integration
async function testGeminiAPI() {
    try {
        console.log('Testing Gemini API integration...');
        const testPrompt = 'Explain how AI works in a few words';
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: testPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
            console.log('Test successful! Response:', data.candidates[0].content.parts[0].text);
            showNotification('API test successful!', 'success');
            return true;
        } else {
            console.error('API test failed:', data);
            showNotification('API test failed. Please check the console for details.', 'error');
            return false;
        }
    } catch (error) {
        console.error('API test error:', error);
        showNotification('API test error. Please check the console for details.', 'error');
        return false;
    }
}

// Function to update dashboard statistics
function updateDashboardStats() {
    // Get counts from localStorage or calculate them
    const savedResumes = localStorage.getItem('resumeData') ? 1 : 0;
    
    // Count downloads from localStorage or set default
    let downloadCount = localStorage.getItem('downloadCount') || 0;
    
    // Count AI suggestions from localStorage or set default
    let aiSuggestionCount = localStorage.getItem('aiSuggestionCount') || 0;
    
    // Count profile views from localStorage or set default
    let profileViewCount = localStorage.getItem('profileViewCount') || 0;
    if (!localStorage.getItem('profileViewCount')) {
        // Increment profile views on first load
        profileViewCount = 1;
        localStorage.setItem('profileViewCount', profileViewCount);
    }
    
    // Update the dashboard stats in the UI - with null checks
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length >= 4) {
        const card1 = statCards[0].querySelector('.stat-info h3');
        const card2 = statCards[1].querySelector('.stat-info h3');
        const card3 = statCards[2].querySelector('.stat-info h3');
        const card4 = statCards[3].querySelector('.stat-info h3');
        
        if (card1) card1.textContent = savedResumes;
        if (card2) card2.textContent = downloadCount;
        if (card3) card3.textContent = aiSuggestionCount;
        if (card4) card4.textContent = profileViewCount;
    }
}

// Function to increment download count
function incrementDownloadCount() {
    let count = parseInt(localStorage.getItem('downloadCount') || 0);
    count++;
    localStorage.setItem('downloadCount', count);
    updateDashboardStats();
}

// Function to increment AI suggestion count
function incrementAISuggestionCount() {
    let count = parseInt(localStorage.getItem('aiSuggestionCount') || 0);
    count++;
    localStorage.setItem('aiSuggestionCount', count);
    updateDashboardStats();
}

// Export functions for global access
window.showSection = showSection;
window.selectTemplate = selectTemplate;
window.saveResume = saveResume;
window.downloadResume = downloadResume;
window.sendAIMessage = sendAIMessage;
window.generateContent = generateContent;
window.optimizeResume = optimizeResume;
window.getJobSpecificSuggestions = getJobSpecificSuggestions;
window.analyzeResume = analyzeResume;
window.getKeywordSuggestions = getKeywordSuggestions;
window.updateDashboardStats = updateDashboardStats;