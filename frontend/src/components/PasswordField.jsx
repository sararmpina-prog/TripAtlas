import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

export default function PasswordField({
  id,
  name,
  value,
  onChange,
  placeholder = "Password",
  required = false,
  autoComplete = "current-password",
  wrapperClassName = "password-input-container",
  toggleClassName = "password-toggle",
  inputClassName,
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={wrapperClassName}>
      <input
        {...rest}
        id={id}
        name={name}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className={inputClassName}
      />

      <button
        type="button"
        className={toggleClassName}
        onClick={() => setShowPassword((currentValue) => !currentValue)}
        aria-label={showPassword ? "Hide password" : "Show password"}
        aria-pressed={showPassword}
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );
}