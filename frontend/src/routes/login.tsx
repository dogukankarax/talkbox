import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

import { login, setToken } from "@/lib/api";
import { LoginSchema } from "@talkbox/shared";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onChange: LoginSchema },
    onSubmit: async ({ value }) => {
      try {
        const response = await login(value.email, value.password);
        if (response.token) {
          setToken(response.token);
          navigate({ to: "/" });
        }
      } catch (error) {
        if (error instanceof Error) setApiError(error.message);
      }
    },
  });

  return (
    <AuthLayout>
      <div className="mb-8 text-center">
        <h1 className="font-mono text-4xl font-bold bg-linear-to-r from-neon-pink via-neon-purple to-neon-cyan bg-clip-text text-transparent">
          TALKBOX
        </h1>
        <p className="mt-2 text-sm text-gray-400">Welcome back</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field name="email">
          {(field) => (
            <div>
              <Label htmlFor={field.name}>EMAIL</Label>
              <Input
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="you@example.com"
              />
              <ErrorMessage message={field.state.meta.errors[0]?.message} />
            </div>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <div>
              <Label htmlFor={field.name}>PASSWORD</Label>
              <Input
                type="password"
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="••••••••"
              />
              <ErrorMessage message={field.state.meta.errors[0]?.message} />
            </div>
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? "..." : "SIGN IN"}
            </Button>
          )}
        </form.Subscribe>

        <ErrorMessage message={apiError} />
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        No account?{" "}
        <Link
          to="/register"
          className="text-neon-cyan hover:text-neon-pink transition-colors"
        >
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
