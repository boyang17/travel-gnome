import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import type { FormEvent, KeyboardEvent } from "react";
import { NewLogo } from "../Logo";

export function Authentication() {
  const { signIn, signUp } = useAuth();
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const inputStyle =
    "border-1 rounded-sm py-1 px-2 min-w-[300px] focus:outline-none shadow-sm";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (register) {
        const duplicateEmailWarning = await checkExistingUser(email);

        if (duplicateEmailWarning) {
          toast.error(duplicateEmailWarning);
          return;
        }

        const { error } = await signUp(email, username, password);

        if (error) {
          handleError(error);
        } else {
          toast.success("Check your email to confirm your signup");
          navigate("/");
        }
      } else {
        const { error } = await signIn(email, password);

        if (error) {
          handleError(error);
        } else {
          toast.success("Signed in successfully");
        }
      }
    } catch (error) {
      console.error("Authorization Error: ", error);
      toast.error("An unexpected error occurred, try again");
    }
  };

  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("An unexpected error occurred");
    }
  };

  const checkExistingUser = async (email: string) => {
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return "This email address is already associated with an account.";
    }
  };

  const handleOnEnter = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSubmit(event);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className=" p-10 rounded-md shadow-xl pointer-events-auto bg-white"
    >
      <div className="flex flex-col w-75 items-center gap-5">
        <NewLogo />
        <p className="font-semibold text-2xl">
          {!register ? "Sign in" : "Create An Account"}
        </p>
        <div>
          <label className="font-semibold flex flex-col" htmlFor="email">
            Email address
          </label>
          <input
            className={inputStyle}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {register && (
          <div>
            <label className="font-semibold flex flex-col" htmlFor="username">
              Username
            </label>
            <input
              className={inputStyle}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              pattern="^[a-zA-Z0-9_]{3,15}$"
              minLength={3}
              maxLength={15}
              placeholder="a-z, 0-9 or _ only"
              required
            />
          </div>
        )}
        <div>
          <label className="font-semibold flex flex-col" htmlFor="password">
            Password
          </label>
          <input
            className={inputStyle}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleOnEnter}
            required
          />
        </div>
        <button
          type="submit"
          className="text-white bg-[#228B22] rounded w-25 py-1 cursor-pointer"
        >
          {!register ? "Sign in" : "Sign up"}
        </button>
        <div className="flex gap-1">
          <p> {!register ? "Don't have an account?" : "Have an account?"}</p>
          <button
            className="text-[#228B22] cursor-pointer"
            onClick={() => {
              setRegister(!register);
              setEmail("");
              setUsername("");
              setPassword("");
            }}
          >
            {!register ? "Sign up" : "Sign in"}
          </button>
        </div>
      </div>
    </form>
  );
}
