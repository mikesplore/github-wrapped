"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Eye, EyeOff, Check, X, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { validateGitHubToken } from "@/lib/github-client";
import { validateGeminiKey } from "@/lib/gemini-client";

export default function SettingsPage() {
  const [githubToken, setGithubToken] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [validating, setValidating] = useState(false);
  const [githubValid, setGithubValid] = useState<boolean | null>(null);
  const [geminiValid, setGeminiValid] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    // Load from localStorage
    const savedGithubToken = localStorage.getItem("user_github_token") || "";
    const savedGeminiKey = localStorage.getItem("user_gemini_key") || "";
    setGithubToken(savedGithubToken);
    setGeminiKey(savedGeminiKey);
  }, []);

  const handleValidate = async () => {
    setValidating(true);
    setValidationError(null);
    setGithubValid(null);
    setGeminiValid(null);

    try {
      // Validate GitHub token if provided
      if (githubToken) {
        const isValid = await validateGitHubToken(githubToken);
        setGithubValid(isValid);
        if (!isValid) {
          setValidationError("GitHub token is invalid");
        }
      }

      // Validate Gemini key if provided
      if (geminiKey) {
        const isValid = await validateGeminiKey(geminiKey);
        setGeminiValid(isValid);
        if (!isValid) {
          setValidationError("Gemini API key is invalid");
        }
      }

      // If both are valid (or not provided), save
      if (
        (!githubToken || githubValid !== false) &&
        (!geminiKey || geminiValid !== false)
      ) {
        handleSave();
      }
    } catch (error) {
      setValidationError("Error validating keys. Please try again.");
      console.error("Validation error:", error);
    } finally {
      setValidating(false);
    }
  };

  const handleSave = () => {
    // Save to localStorage
    if (githubToken) {
      localStorage.setItem("user_github_token", githubToken);
    } else {
      localStorage.removeItem("user_github_token");
    }

    if (geminiKey) {
      localStorage.setItem("user_gemini_key", geminiKey);
    } else {
      localStorage.removeItem("user_gemini_key");
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClear = () => {
    setGithubToken("");
    setGeminiKey("");
    setGithubValid(null);
    setGeminiValid(null);
    setValidationError(null);
    localStorage.removeItem("user_github_token");
    localStorage.removeItem("user_gemini_key");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500/10 via-background to-blue-500/10 p-4">
      <div className="mx-auto max-w-2xl space-y-6 py-8">
        {/* Header */}
        <div className="space-y-2">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            ← Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-accent/10 p-3">
              <Settings className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">API Settings</h1>
              <p className="text-muted-foreground">Avoid rate limits with your own API keys</p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="text-lg">Why provide your own keys?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>✅ <strong>Higher rate limits</strong> - 5,000 requests/hour with your own GitHub token</p>
            <p>✅ <strong>No shared quota</strong> - Your Gemini API key won't be affected by other users</p>
            <p>✅ <strong>Private repos access</strong> - Your token can access your private repositories</p>
            <p>✅ <strong>Stored locally</strong> - Keys are saved in your browser, never sent to our servers</p>
            <p className="pt-2 text-xs">💡 Optional: You can still use the app without providing keys, but you may hit rate limits during peak times.</p>
          </CardContent>
        </Card>

        {/* GitHub Token */}
        <Card>
          <CardHeader>
            <CardTitle>GitHub Personal Access Token</CardTitle>
            <CardDescription>
              Create a token at{" "}
              <a 
                href="https://github.com/settings/tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                github.com/settings/tokens
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="github-token">GitHub Token (Classic)</Label>
              <div className="relative">
                <Input
                  id="github-token"
                  type={showGithubToken ? "text" : "password"}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={githubToken}
                  onChange={(e) => {
                    setGithubToken(e.target.value);
                    setGithubValid(null);
                  }}
                  className="pr-20"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {githubValid !== null && (
                    githubValid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )
                  )}
                  <button
                    type="button"
                    onClick={() => setShowGithubToken(!showGithubToken)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {showGithubToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Required scopes: <code className="bg-muted px-1 py-0.5 rounded">repo</code>, <code className="bg-muted px-1 py-0.5 rounded">read:user</code>
              </p>
            </div>

            <div className="rounded-md bg-muted/50 p-3 space-y-2 text-xs">
              <p className="font-semibold">How to create:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)</li>
                <li>Click "Generate new token (classic)"</li>
                <li>Select scopes: <code>repo</code> and <code>read:user</code></li>
                <li>Generate token and copy it here</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Gemini API Key */}
        <Card>
          <CardHeader>
            <CardTitle>Google Gemini API Key</CardTitle>
            <CardDescription>
              Get your free API key at{" "}
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                aistudio.google.com/app/apikey
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gemini-key">Gemini API Key</Label>
              <div className="relative">
                <Input
                  id="gemini-key"
                  type={showGeminiKey ? "text" : "password"}
                  placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={geminiKey}
                  onChange={(e) => {
                    setGeminiKey(e.target.value);
                    setGeminiValid(null);
                  }}
                  className="pr-20"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {geminiValid !== null && (
                    geminiValid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )
                  )}
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Free tier: 15 requests/minute, 1,500 requests/day
              </p>
            </div>

            <div className="rounded-md bg-muted/50 p-3 space-y-2 text-xs">
              <p className="font-semibold">How to get:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Visit Google AI Studio (link above)</li>
                <li>Sign in with your Google account</li>
                <li>Click "Get API Key" or "Create API Key"</li>
                <li>Copy the key and paste it here</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Validation Error */}
        {validationError && (
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="pt-6">
              <p className="text-sm text-red-400">{validationError}</p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            onClick={handleValidate}
            disabled={validating || (!githubToken && !geminiKey)}
            className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500"
          >
            {validating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : saved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Saved!
              </>
            ) : (
              "Validate & Save"
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleClear}
          >
            <X className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>

        {/* Security Notice */}
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              🔒 <strong>Security:</strong> Your API keys are stored only in your browser's local storage and are never sent to our servers. 
              They're transmitted directly to GitHub and Google APIs from your browser. You can clear them anytime.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
