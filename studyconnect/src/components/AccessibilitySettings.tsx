import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../accessibility.css';

interface AccessibilitySettings {
  darkMode: boolean;
  colorBlindMode: string;
  focusOutline: boolean;
  largeText: boolean;
}

const defaultSettings: AccessibilitySettings = {
  darkMode: false,
  colorBlindMode: 'none',
  focusOutline: false,
  largeText: false
};

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('accessibilitySettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));

    // Apply settings to document
    const root = document.documentElement;

    // Dark mode
    if (settings.darkMode) {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }

    // Focus outline
    if (settings.focusOutline) {
      root.classList.add('focus-outline-visible');
    } else {
      root.classList.remove('focus-outline-visible');
    }

    // Large text
    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Color blind modes - remove all first
    root.classList.remove(
      'colorblind-deuteranopia',
      'colorblind-protanopia',
      'colorblind-tritanopia',
      'colorblind-high-contrast'
    );

    // Add selected color blind mode
    if (settings.colorBlindMode !== 'none') {
      root.classList.add(`colorblind-${settings.colorBlindMode}`);
    }
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return { settings, updateSetting };
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { settings, updateSetting } = useAccessibility();

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="settings-modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div 
        className="settings-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative' }}
      >
        <button 
          className="settings-close" 
          onClick={onClose}
        >
          ×
        </button>

        <h2 id="settings-title">⚙️ Accessibility Settings</h2>

        {/* DISPLAY SECTION */}
        <div className="settings-section">
          <h3>Display</h3>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">🌙 Dark Mode</span>
              <span className="setting-description">Reduce eye strain in low light</span>
            </div>
            <button
              className={`toggle-switch ${settings.darkMode ? 'active' : ''}`}
              onClick={() => updateSetting('darkMode', !settings.darkMode)}
              role="switch"
            />
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">🔍 Large Text</span>
              <span className="setting-description">Increase text size for better readability</span>
            </div>
            <button
              className={`toggle-switch ${settings.largeText ? 'active' : ''}`}
              onClick={() => updateSetting('largeText', !settings.largeText)}
              role="switch"
            />
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">🎯 Focus Outline</span>
              <span className="setting-description">Show visible outline when navigating with keyboard</span>
            </div>
            <button
              className={`toggle-switch ${settings.focusOutline ? 'active' : ''}`}
              onClick={() => updateSetting('focusOutline', !settings.focusOutline)}
              role="switch"
            />
          </div>
        </div>

        {/* VISION SECTION */}
        <div className="settings-section">
          <h3>Vision Support</h3>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">👁️ Color Blind Mode</span>
              <span className="setting-description">Adjust colors for better visibility</span>
            </div>
            <select
              className="colorblind-select"
              value={settings.colorBlindMode}
              onChange={(e) => updateSetting('colorBlindMode', e.target.value)}
            >
              <option value="none">None</option>
              <option value="deuteranopia">Deuteranopia (Red-Green)</option>
              <option value="protanopia">Protanopia (Red-Green)</option>
              <option value="tritanopia">Tritanopia (Blue-Yellow)</option>
              <option value="high-contrast">High Contrast</option>
            </select>
          </div>
        </div>

        {/* INFO SECTION */}
        <div className="settings-section">
          <div style={{ 
            padding: '16px', 
            background: settings.darkMode ? '#374151' : '#f0f9ff', 
            borderRadius: '12px',
            fontSize: '13px',
            color: settings.darkMode ? '#94a3b8' : '#0369a1'
          }}>
            <strong>Tip:</strong> These settings are saved locally and will persist when you return.
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

interface SettingsButtonProps {
  onClick: () => void;
}

export function SettingsButton({ onClick }: SettingsButtonProps) {
  return (
    <button 
      className="settings-button" 
      onClick={onClick}
    >
      <span style={{ fontSize: '18px' }}>⚙️</span>
      <span>Settings</span>
    </button>
  );
}
