import React, { useState } from 'react';
import styled from 'styled-components';
import { FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';

const FormGroup = styled.div`
  margin-bottom: 20px;
  width: 100%;
  
  &.has-error .form-input {
    border-color: #dc3545;
    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
  }
  
  &.has-success .form-input {
    border-color: #28a745;
    box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
  }
  
  &.has-warning .form-input {
    border-color: #ffc107;
    box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.1);
  }
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: var(--dark-gray);
  margin-bottom: 8px;
  font-size: 14px;
  
  .required {
    color: #dc3545;
    margin-left: 4px;
  }
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: ${props => props.disabled ? '#f8f9fa' : 'white'};
  
  &:focus {
    outline: none;
    border-color: var(--primary-coral);
    box-shadow: 0 0 0 3px rgba(255, 127, 80, 0.1);
  }
  
  &:disabled {
    cursor: not-allowed;
    color: #6c757d;
  }
  
  &.with-icon {
    padding-right: 48px;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;
  background: ${props => props.disabled ? '#f8f9fa' : 'white'};
  
  &:focus {
    outline: none;
    border-color: var(--primary-coral);
    box-shadow: 0 0 0 3px rgba(255, 127, 80, 0.1);
  }
  
  &:disabled {
    cursor: not-allowed;
    color: #6c757d;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  background: ${props => props.disabled ? '#f8f9fa' : 'white'};
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: var(--primary-coral);
    box-shadow: 0 0 0 3px rgba(255, 127, 80, 0.1);
  }
  
  &:disabled {
    cursor: not-allowed;
    color: #6c757d;
  }
`;

const IconButton = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 18px;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.3s ease;
  
  &:hover {
    color: var(--primary-coral);
  }
`;

const ValidationMessage = styled.div`
  margin-top: 6px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &.error {
    color: #dc3545;
  }
  
  &.success {
    color: #28a745;
  }
  
  &.warning {
    color: #ffc107;
  }
  
  &.info {
    color: #17a2b8;
  }
`;

const PasswordStrength = styled.div`
  margin-top: 8px;
  
  .strength-bar {
    height: 4px;
    border-radius: 2px;
    background: #e0e0e0;
    overflow: hidden;
    margin-bottom: 4px;
  }
  
  .strength-fill {
    height: 100%;
    transition: all 0.3s ease;
    
    &.weak {
      width: 33%;
      background: #dc3545;
    }
    
    &.medium {
      width: 66%;
      background: #ffc107;
    }
    
    &.strong {
      width: 100%;
      background: #28a745;
    }
  }
  
  .strength-text {
    font-size: 12px;
    font-weight: 500;
    
    &.weak { color: #dc3545; }
    &.medium { color: #ffc107; }
    &.strong { color: #28a745; }
  }
`;

const CharacterCount = styled.div`
  font-size: 12px;
  color: #6c757d;
  text-align: right;
  margin-top: 4px;
  
  &.near-limit {
    color: #ffc107;
  }
  
  &.over-limit {
    color: #dc3545;
  }
`;

// Main FormInput component
const FormInput = ({
  type = 'text',
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  error,
  success,
  warning,
  info,
  showPasswordStrength = false,
  passwordStrength,
  maxLength,
  options = [],
  rows = 4,
  className,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const hasError = error && error.length > 0;
  const hasSuccess = success && !hasError;
  const hasWarning = warning && warning.length > 0 && !hasError;
  const hasInfo = info && !hasError && !hasWarning;
  
  const getValidationClass = () => {
    if (hasError) return 'has-error';
    if (hasSuccess) return 'has-success';
    if (hasWarning) return 'has-warning';
    return '';
  };
  
  const getCharacterCountClass = () => {
    if (!maxLength) return '';
    const length = value ? value.length : 0;
    const ratio = length / maxLength;
    
    if (ratio > 1) return 'over-limit';
    if (ratio > 0.8) return 'near-limit';
    return '';
  };
  
  const renderInput = () => {
    const inputProps = {
      name,
      value: value || '',
      onChange: (e) => onChange(name, e.target.value),
      onBlur: () => onBlur && onBlur(name),
      placeholder,
      disabled,
      maxLength,
      className: `form-input ${type === 'password' ? 'with-icon' : ''}`,
      ...props
    };
    
    switch (type) {
      case 'password':
        return (
          <Input
            {...inputProps}
            type={showPassword ? 'text' : 'password'}
          />
        );
        
      case 'textarea':
        return (
          <TextArea
            {...inputProps}
            rows={rows}
          />
        );
        
      case 'select':
        return (
          <Select {...inputProps}>
            <option value="">Select {label}</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );
        
      default:
        return <Input {...inputProps} type={type} />;
    }
  };
  
  const renderMessages = () => {
    const messages = [];
    
    if (hasError) {
      error.forEach((msg, index) => (
        messages.push(
          <ValidationMessage key={`error-${index}`} className="error">
            <FiAlertCircle />
            {msg}
          </ValidationMessage>
        )
      ));
    }
    
    if (hasSuccess) {
      messages.push(
        <ValidationMessage key="success" className="success">
          <FiCheckCircle />
          {success}
        </ValidationMessage>
      );
    }
    
    if (hasWarning && !hasError) {
      warning.forEach((msg, index) => (
        messages.push(
          <ValidationMessage key={`warning-${index}`} className="warning">
            <FiAlertCircle />
            {msg}
          </ValidationMessage>
        )
      ));
    }
    
    if (hasInfo && !hasError && !hasWarning) {
      messages.push(
        <ValidationMessage key="info" className="info">
          <FiInfo />
          {info}
        </ValidationMessage>
      );
    }
    
    return messages;
  };
  
  return (
    <FormGroup className={`${getValidationClass()} ${className || ''}`}>
      {label && (
        <Label htmlFor={name}>
          {label}
          {required && <span className="required">*</span>}
        </Label>
      )}
      
      <InputContainer>
        {renderInput()}
        
        {type === 'password' && (
          <IconButton
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </IconButton>
        )}
      </InputContainer>
      
      {showPasswordStrength && passwordStrength && (
        <PasswordStrength>
          <div className="strength-bar">
            <div className={`strength-fill ${passwordStrength.strength}`} />
          </div>
          <div className={`strength-text ${passwordStrength.strength}`}>
            Password strength: {passwordStrength.strength}
          </div>
        </PasswordStrength>
      )}
      
      {maxLength && (
        <CharacterCount className={getCharacterCountClass()}>
          {value ? value.length : 0}/{maxLength}
        </CharacterCount>
      )}
      
      {renderMessages()}
    </FormGroup>
  );
};

export default FormInput;