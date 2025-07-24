import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";

export function TestAuth() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [fullName, setFullName] = useState("Test User");
  const [result, setResult] = useState("");

  const testRegister = async () => {
    try {
      console.log("Starting registration test...");
      console.log("Request data:", { fullName, email, password });
      
      const response = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          email,
          password,
        }),
      });
      
      console.log("Registration response:", response);
      setResult(`SUCCESS: ${JSON.stringify(response, null, 2)}`);
      
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        console.log("Token stored successfully");
        setResult(prev => prev + "\n\nToken stored in localStorage!");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      setResult(`ERROR: ${error.message}\n\nFull error: ${JSON.stringify(error, null, 2)}`);
    }
  };

  const testLogin = async () => {
    try {
      console.log("Starting login test...");
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      });
      
      console.log("Login response:", response);
      setResult(JSON.stringify(response, null, 2));
    } catch (error: any) {
      console.error("Login error:", error);
      setResult(`Error: ${error.message}`);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-gray-800 rounded-lg">
      <h2 className="text-white text-xl mb-4">Auth Test</h2>
      
      <div className="space-y-4">
        <Input
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="bg-gray-700 text-white"
        />
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-gray-700 text-white"
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-gray-700 text-white"
        />
        
        <div className="flex gap-2">
          <Button onClick={testRegister} className="bg-blue-600">
            Test Register
          </Button>
          <Button onClick={testLogin} className="bg-green-600">
            Test Login
          </Button>
        </div>
        
        {result && (
          <pre className="text-white text-xs bg-gray-900 p-4 rounded overflow-auto max-h-40">
            {result}
          </pre>
        )}
      </div>
    </div>
  );
}