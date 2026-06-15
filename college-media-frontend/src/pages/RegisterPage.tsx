import { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const register = async () => {
    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      alert("Registration Successful");

      navigate("/login");
    } catch (error) {
      console.error(error);

      alert("Registration Failed");
    }
  };

  return (
    <div
      className="
      min-h-screen
      flex
      items-center
      justify-center
      p-4
      overflow-x-hidden
    "
    >
      <div
        className="
        w-full
        max-w-md
        border
        rounded-xl
        p-4
        sm:p-6
      "
      >
        <h1
          className="
          text-2xl
          sm:text-3xl
          font-bold
          mb-6
        "
        >
          Register
        </h1>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="
          border
          p-2
          w-full
          mb-3
          min-h-[44px]
          rounded
        "
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="
          border
          p-2
          w-full
          mb-3
          min-h-[44px]
          rounded
        "
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="
          border
          p-2
          w-full
          mb-4
          min-h-[44px]
          rounded
        "
        />

        <button
          onClick={register}
          className="
          w-full
          bg-black
          text-white
          p-2
          rounded
          min-h-[44px]
        "
        >
          Register
        </button>
      </div>
    </div>
  );
}
