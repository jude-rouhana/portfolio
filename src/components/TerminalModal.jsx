import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DOS_BLUE = '#000080';
const DOS_WHITE = '#c0c0c0';
const DOS_BRIGHT_WHITE = '#ffffff';
const DOS_YELLOW = '#ffff00';
const DOS_BLACK = '#000000';
const DOS_CYAN = '#00aaaa';
const DOS_GREY = '#c0c0c0';

const ASCII_LOGO = `
       _           _        
      | |         | |       
      | |_   _  __| | ___   
  _   | | | | |/ _\` |/ _ \\  
 | |__| | |_| | (_| |  __/  
  \\____/ \\__,_|\\__,_|\\___|  
`;

const DOSPopup = ({ title, children, showLogo = false, onClose }) => (
    <div style={{
        backgroundColor: DOS_GREY,
        color: DOS_BLACK,
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px 16px',
        boxShadow: '16px 16px 0px rgba(0,0,0,0.5)',
        margin: '16px 0',
        border: `2px solid ${DOS_BRIGHT_WHITE}`,
        borderRightColor: '#555555',
        borderBottomColor: '#555555',
        maxWidth: '100%',
        overflowX: 'auto'
    }}>
        {title && <div style={{
            marginBottom: 16,
            width: '100%',
            textAlign: 'center',
            borderBottom: '1px solid black',
            paddingBottom: 4
        }}>- {title} -</div>}

        {showLogo && (
            <pre style={{ margin: '0 0 16px 0', fontSize: '14px', lineHeight: '14px', fontWeight: 'bold', fontFamily: 'inherit' }}>
                {ASCII_LOGO}
            </pre>
        )}

        <div style={{ textAlign: 'center', lineHeight: '1.5' }}>{children}</div>

        <div style={{ marginTop: 24 }} onClick={(e) => { e.stopPropagation(); onClose(); }}>
        </div>
    </div>
);

const TerminalModal = ({ isOpen, onClose }) => {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState([]);
    const [commandHistory, setCommandHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    const initialHistory = [
        {
            type: 'output', content: (
                <div style={{ marginBottom: 16 }}>
                    <div>Welcome to JudeOS. Type <span style={{ color: DOS_YELLOW }}>help</span> for a list of commands.</div>
                </div>
            )
        }
    ];

    // Auto-scroll to bottom when history changes
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    // Focus input on mount and whenever modal opens
    // Reset state when modal closes
    useEffect(() => {
        if (isOpen) {
            if (history.length === 0) {
                setHistory(initialHistory);
            }
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);

            const handleGlobalKeyDown = (e) => {
                if (e.key === 'Escape') {
                    onClose();
                }
            };
            window.addEventListener('keydown', handleGlobalKeyDown);
            return () => window.removeEventListener('keydown', handleGlobalKeyDown);
        } else {
            setInput('');
            setHistory([]);
            setCommandHistory([]);
            setHistoryIndex(-1);
        }
    }, [isOpen]);

    const handlePopupClose = () => {
        // We could implement a feature to remove the popup, but in DOS terminals, output just scrolls up.
        // So hitting OK just focuses the input again and maybe echoes 'OK'.
        setHistory(prev => [...prev, { type: 'output', content: <div style={{ color: '#00ff00' }}>OK.</div> }]);
        inputRef.current?.focus();
    };

    const processCommand = (cmd) => {
        const trimmedCmd = cmd.trim().toLowerCase();
        const args = trimmedCmd.split(' ');
        const command = args[0];

        let output;

        switch (command) {
            case 'help':
                output = (
                    <DOSPopup title="Help Menu" onClose={handlePopupClose}>
                        <div style={{ textAlign: 'left', minWidth: '300px' }}>
                            <table style={{ width: '100%', borderSpacing: '0 8px' }}>
                                <tbody>
                                    <tr><td style={{ fontWeight: 'bold', paddingRight: 16 }}>ABOUT</td><td>Learn more about me</td></tr>
                                    <tr><td style={{ fontWeight: 'bold' }}>PROJECTS</td><td>View my work</td></tr>
                                    <tr><td style={{ fontWeight: 'bold' }}>RESUME</td><td>Open my resume</td></tr>
                                    <tr><td style={{ fontWeight: 'bold' }}>CONTACT</td><td>Get in touch</td></tr>
                                    <tr><td style={{ fontWeight: 'bold', color: '#ff0000' }}>CLEAR</td><td>Clear the screen</td></tr>
                                    <tr><td style={{ fontWeight: 'bold', color: '#ff0000' }}>EXIT</td><td>Close terminal</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </DOSPopup>
                );
                break;
            case 'about':
                output = (
                    <DOSPopup title="About Jude Rouhana" showLogo={true} onClose={handlePopupClose}>
                        <div style={{ maxWidth: '400px', textAlign: 'center' }}>
                            I'm a software developer and creative technologist with a unique blend of technical skills and artistic vision.
                            <br /><br />
                            I graduated from Hamilton College in 2025 as a Computer Science major and Digital Arts and Music minors.
                            <br /><br />
                            I love to build: from software and hardware to music, digital art, and games.
                        </div>
                    </DOSPopup>
                );
                break;
            case 'projects':
                output = (
                    <DOSPopup title="Project Library" onClose={handlePopupClose}>
                        <div style={{ textAlign: 'left', maxWidth: '500px' }}>
                            <div style={{ marginBottom: 12 }}><b>1. VBT System</b><br />The Velocity-Based Training (VBT) System is a device and full-stack web application created for Hamilton College's Athletics Department.</div>
                            <div style={{ marginBottom: 12 }}><b>2. Chord Neural Network</b><br />A neural network to generate musically coherent chord progressions by learning harmonic relationships between chords.</div>
                            <div style={{ marginBottom: 12 }}><b>3. FocusAid</b><br />A Chrome extension which serves as an all-in-one focus tool for people with Autism and/or ADHD.</div>
                            <div><b>4. Terminal UI</b><br />Interactive portfolio shell (You are here!)</div>
                        </div>
                    </DOSPopup>
                );
                break;
            case 'resume':
                output = <div>Opening resume in a new tab... [OK]</div>;
                window.open('/Jude Rouhana Resume.pdf', '_blank');
                break;
            case 'contact':
                output = (
                    <DOSPopup title="Contact Information" onClose={handlePopupClose}>
                        <div style={{ textAlign: 'left', minWidth: '250px' }}>
                            <div><strong>Email:</strong> juderouhana@gmail.com</div>
                            <div style={{ marginTop: 8 }}><strong>LinkedIn:</strong> linkedin.com/in/jude-rouhana/</div>
                            <div style={{ marginTop: 8 }}><strong>Website:</strong> juderouhana.com</div>
                        </div>
                    </DOSPopup>
                );
                break;
            case 'clear':
                setHistory([]);
                return;
            case 'exit':
                onClose();
                return;
            case '':
                return;
            default:
                output = <div>Bad command or file name</div>;
        }

        setHistory(prev => [...prev, { type: 'input', content: cmd }, { type: 'output', content: output }]);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const cmd = input;
            if (cmd.trim()) {
                processCommand(cmd);
                setCommandHistory(prev => [cmd, ...prev]);
                setHistoryIndex(-1);
            } else {
                setHistory(prev => [...prev, { type: 'input', content: '' }]);
            }
            setInput('');

            setTimeout(() => {
                if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }, 50);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(commandHistory[newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(commandHistory[newIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput('');
            }
        } else if (e.key === 'c' && e.ctrlKey) {
            setInput('');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div
                className="terminal-overlay"
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(5px)' // Modern touch for pure aesthetics
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="terminal-shell"
                    onClick={(e) => {
                        e.stopPropagation();
                        inputRef.current?.focus();
                    }}
                    style={{
                        width: 'min(1000px, 98vw)',
                        height: 'min(700px, 96vh)',
                        backgroundColor: DOS_BLUE,
                        border: `2px solid ${DOS_BRIGHT_WHITE}`,
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
                        fontFamily: '"Consolas", "Courier New", monospace',
                        fontSize: '16px',
                        color: DOS_BRIGHT_WHITE,
                        userSelect: 'text'
                    }}
                >
                    {/* Top Menu */}
                    <div style={{
                        backgroundColor: DOS_BLUE,
                        color: DOS_YELLOW,
                        display: 'flex',
                        padding: '4px 16px',
                        justifyContent: 'space-between',
                        userSelect: 'none',
                        borderBottom: '2px double #ffffff'
                    }}>
                    </div>

                    {/* Main Content Area */}
                    <div
                        ref={scrollRef}
                        style={{
                            flex: 1,
                            padding: '16px',
                            overflowY: 'auto',
                            lineHeight: '1.4',
                            cursor: 'text'
                        }}
                    >
                        {history.map((entry, i) => (
                            <div key={i} style={{ marginBottom: entry.type === 'input' ? '4px' : '16px' }}>
                                {entry.type === 'input' ? (
                                    <div style={{ display: 'flex' }}>
                                        <span style={{ marginRight: '8px' }}>C:\JUDE\PORTFOLIO&gt;</span>
                                        <span>{entry.content}</span>
                                    </div>
                                ) : (
                                    <div>
                                        {entry.content}
                                    </div>
                                )}
                            </div>
                        ))}

                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '8px' }}>C:\JUDE\PORTFOLIO&gt;</span>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                spellCheck={false}
                                autoComplete="off"
                                style={{
                                    flex: 1,
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: DOS_BRIGHT_WHITE,
                                    fontFamily: 'inherit',
                                    fontSize: 'inherit',
                                    padding: 0
                                }}
                            />
                        </div>
                    </div>

                    {/* Bottom Status Bar */}
                    <div style={{
                        backgroundColor: DOS_BLACK,
                        color: DOS_WHITE,
                        display: 'flex',
                        padding: '4px 16px',
                        justifyContent: 'space-between',
                        userSelect: 'none'
                    }}>
                        <div>
                            <span style={{ color: DOS_YELLOW, cursor: 'pointer' }} onClick={onClose}>ESC</span> Quit
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default TerminalModal;
