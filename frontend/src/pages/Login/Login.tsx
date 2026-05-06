import { useEffect, useRef, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import Button from "../../components/Button/Button";
import Dropdown from "../../components/Dropdown/Dropdown";
import FadeIn from "../../components/FadeIn/FadeIn";
import { loginUser, registerUser } from "../../utils/api/api";
import SuccessModal from "./components/SuccessModal/SuccessModal";
import type { Option } from "../../utils/types";
import styles from "./Login.module.css";

const languageOptions: Option[] = [
  { id: "en", name: "English" },
  { id: "fi", name: "Suomi" },
];

const Login = () => {
  const navigate = useNavigate();
  const [registerOpen, setRegisterOpen] = useState<boolean>(false);
  const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");
  const [error, setError] = useState<string | null>();
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [showPasswordRequirements, setShowPasswordRequirements] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  const validateUsername = (username: string, isRegister: boolean): string | null => {
    if (isRegister) {
      if (!username.trim()) {
        return t("pages.login.usernameRequired");
      }
      if (username.length < 3) {
        return t("pages.login.usernameTooShort");
      }
      if (username.length > 20) {
        return t("pages.login.usernameTooLong");
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return t("pages.login.usernameInvalidChars");
      }
    }
    return null;
  };

  const validatePassword = (password: string, isRegister: boolean = false): string | null => {
    if (!password.trim()) {
      return t("pages.login.passwordRequired");
    }
    
    if (isRegister) {
      if (password.length < 8) {
        return t("pages.login.passwordTooShort");
      }
      if (!/(?=.*[a-z])/.test(password)) {
        return t("pages.login.passwordMissingLowercase");
      }
      if (!/(?=.*[A-Z])/.test(password)) {
        return t("pages.login.passwordMissingUppercase");
      }
      if (!/(?=.*\d)/.test(password)) {
        return t("pages.login.passwordMissingNumber");
      }
      if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
        return t("pages.login.passwordMissingSpecial");
      }
    }
    
    return null;
  };

  const validateLoginForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    const usernameError = validateUsername(username, false);
    if (usernameError) errors.username = usernameError;
    
    const passwordError = validatePassword(password, false);
    if (passwordError) errors.password = passwordError;
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    const usernameError = validateUsername(username, true);
    if (usernameError) errors.username = usernameError;
    
    const passwordError = validatePassword(password, true);
    if (passwordError) errors.password = passwordError;
    
    if (!passwordConfirm.trim()) {
      errors.passwordConfirm = t("pages.login.confirmPasswordRequired");
    } else if (password !== passwordConfirm) {
      errors.passwordConfirm = t("pages.login.passwordsDontMatch");
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getPasswordStrength = (password: string): {score: number, requirements: {[key: string]: boolean}} => {
    const requirements = {
      length: password.length >= 8,
      lowercase: /(?=.*[a-z])/.test(password),
      uppercase: /(?=.*[A-Z])/.test(password),
      number: /(?=.*\d)/.test(password),
      special: /(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)
    };
    
    const score = Object.values(requirements).filter(Boolean).length;
    return { score, requirements };
  };

  const getPasswordStrengthColor = (score: number): string => {
    if (score <= 1) return '#ff4444';
    if (score <= 2) return '#ff8800';
    if (score <= 3) return '#ffbb00';
    if (score <= 4) return '#88dd00';
    return '#00cc00';
  };

  const getPasswordStrengthText = (score: number): string => {
    if (score <= 1) return t("pages.login.passwordStrengthVeryWeak");
    if (score <= 2) return t("pages.login.passwordStrengthWeak");
    if (score <= 3) return t("pages.login.passwordStrengthFair");
    if (score <= 4) return t("pages.login.passwordStrengthGood");
    return t("pages.login.passwordStrengthStrong");
  };

  const startTimeout = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setError(null);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleFieldChange = (field: string, value: string) => {
    if (field === 'username') {
      setUsername(value.trim());
    } else if (field === 'password') {
      setPassword(value);
    } else if (field === 'passwordConfirm') {
      setPasswordConfirm(value);
    }
    
    setFieldErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  const handlePasswordFocus = () => {
    if (registerOpen) {
      setShowPasswordRequirements(true);
    }
  };

  const handlePasswordBlur = () => {
    setTimeout(() => setShowPasswordRequirements(false), 200);
  };

  const submitRegister = async () => {
    if (!validateRegisterForm()) {
      return;
    }

    try {
      await registerUser(username, password);
      setError(null);
      setFieldErrors({});
      setRegisterOpen(false);
      setSuccessModalOpen(true);
    } catch (err: any) {
      const errorMessage = err.message;
      if (errorMessage === "pages.login.networkError" || 
          errorMessage === "pages.login.usernameAlreadyExists" || 
          errorMessage === "pages.login.wrongUsernameOrPassword" ||
          errorMessage === "pages.login.tooManyAttempts" ||
          errorMessage === "pages.login.tooManyRegistrationAttempts" ||
          errorMessage === "pages.login.weakPassword" ||
          errorMessage === "pages.login.invalidUsername") {
        setError(t(errorMessage));
      } else {
        setError(err.message);
      }
      startTimeout();
    }
  };

  const submitLogin = async () => {
    if (!validateLoginForm()) {
      return;
    }

    try {
      const data = await loginUser(username, password);
      setError(null);
      setFieldErrors({});

      // Save tokens in localStorage
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("username", data.username);

      // Redirect / update state
      navigate("/");
    } catch (err: any) {
      const errorMessage = err.message;
      if (errorMessage === "pages.login.networkError" || 
          errorMessage === "pages.login.usernameAlreadyExists" || 
          errorMessage === "pages.login.wrongUsernameOrPassword" ||
          errorMessage === "pages.login.tooManyAttempts" ||
          errorMessage === "pages.login.tooManyRegistrationAttempts" ||
          errorMessage === "pages.login.weakPassword" ||
          errorMessage === "pages.login.invalidUsername") {
        setError(t(errorMessage));
      } else {
        setError(err.message);
      }
      startTimeout();
    }
  };

  return (
    <FadeIn>
      <div className={styles.login}>
        <div className={styles.logo}>
          <b>DARTS</b> SCORES
        </div>
        {registerOpen && (
          <>
            <div className={styles.form}>
              <input
                onChange={(e) => handleFieldChange('username', e.target.value)}
                type="text"
                className={`${styles.loginInput} ${fieldErrors.username ? styles.errorInput : ''}`}
                placeholder={t("pages.login.username")}
                value={username}
              />
              {fieldErrors.username && (
                <div className={styles.fieldError}>{fieldErrors.username}</div>
              )}
              <input
                onChange={(e) => handleFieldChange('password', e.target.value)}
                onFocus={handlePasswordFocus}
                onBlur={handlePasswordBlur}
                type="password"
                className={`${styles.loginInput} ${fieldErrors.password ? styles.errorInput : ''}`}
                placeholder={t("pages.login.password")}
                value={password}
              />
              {fieldErrors.password && (
                <div className={styles.fieldError}>{fieldErrors.password}</div>
              )}
              {showPasswordRequirements && registerOpen && (
                <div className={styles.passwordRequirements}>
                  <div className={styles.passwordStrengthBar}>
                    <div className={styles.passwordStrengthFill}>
                      <div 
                        className={styles.passwordStrengthProgress}
                        style={{
                          width: `${(getPasswordStrength(password).score / 5) * 100}%`,
                          backgroundColor: getPasswordStrengthColor(getPasswordStrength(password).score)
                        }}
                      />
                    </div>
                    <span className={styles.passwordStrengthText}>
                      {getPasswordStrengthText(getPasswordStrength(password).score)}
                    </span>
                  </div>
                  <div className={styles.requirementList}>
                    <div className={`${styles.requirement} ${getPasswordStrength(password).requirements.length ? styles.met : ''}`}>
                      {t("pages.login.requirementLength")}
                    </div>
                    <div className={`${styles.requirement} ${getPasswordStrength(password).requirements.lowercase ? styles.met : ''}`}>
                      {t("pages.login.requirementLowercase")}
                    </div>
                    <div className={`${styles.requirement} ${getPasswordStrength(password).requirements.uppercase ? styles.met : ''}`}>
                      {t("pages.login.requirementUppercase")}
                    </div>
                    <div className={`${styles.requirement} ${getPasswordStrength(password).requirements.number ? styles.met : ''}`}>
                      {t("pages.login.requirementNumber")}
                    </div>
                    <div className={`${styles.requirement} ${getPasswordStrength(password).requirements.special ? styles.met : ''}`}>
                      {t("pages.login.requirementSpecial")}
                    </div>
                  </div>
                </div>
              )}
              <input
                onChange={(e) => handleFieldChange('passwordConfirm', e.target.value)}
                type="password"
                className={`${styles.loginInput} ${fieldErrors.passwordConfirm ? styles.errorInput : ''}`}
                placeholder={t("pages.login.confirmPassword")}
                value={passwordConfirm}
              />
              {fieldErrors.passwordConfirm && (
                <div className={styles.fieldError}>{fieldErrors.passwordConfirm}</div>
              )}
            </div>
            <div className={styles.buttons}>
              <Button onClick={() => setRegisterOpen(false)} text={t("pages.login.backToLogin")} />
              <Button
                onClick={() => submitRegister()}
                text={t("pages.login.register")}
                variant={"green"}
              />
            </div>
          </>
        )}
        {!registerOpen && (
          <>
            <div className={styles.form}>
              <input
                type="text"
                className={`${styles.loginInput} ${fieldErrors.username ? styles.errorInput : ''}`}
                placeholder={t("pages.login.username")}
                value={username}
                onChange={(e) => handleFieldChange('username', e.target.value)}
              />
              {fieldErrors.username && (
                <div className={styles.fieldError}>{fieldErrors.username}</div>
              )}
              <input
                type="password"
                className={`${styles.loginInput} ${fieldErrors.password ? styles.errorInput : ''}`}
                placeholder={t("pages.login.password")}
                value={password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
              />
              {fieldErrors.password && (
                <div className={styles.fieldError}>{fieldErrors.password}</div>
              )}
            </div>
            <div className={styles.buttons}>
              <Button onClick={() => setRegisterOpen(true)} text={t("pages.login.register")} />
              <Button
                onClick={() => submitLogin()}
                text={t("pages.login.login")}
                variant={"green"}
              />
              <Button
                onClick={() => {
                  localStorage.removeItem("username");
                  localStorage.setItem("offlineMode", "true");
                  navigate("/");
                }}
                text={t("pages.login.playOffline")}
                variant="outline"
                className={styles.offlineButton}
              />
            </div>
          </>
        )}
        <div className={styles.languageSelector}>
          <Dropdown
            options={languageOptions}
            selectedOption={currentLanguage}
            setSelectedOption={changeLanguage}
          />
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <SuccessModal 
          open={successModalOpen} 
          close={() => setSuccessModalOpen(false)} 
        />
      </div>
    </FadeIn>
  );
};

export default Login;
