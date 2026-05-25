import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

import { register, setToken } from "@/lib/api";
import { RegisterSchema } from "@talkbox/shared";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/register")({
  component: RouteComponent,
});

function RouteComponent() {
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
    validators: {
      onChange: RegisterSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const response = await register(
          value.username,
          value.email,
          value.password,
        );
        if (response.token) {
          setToken(response.token);
          navigate({ to: "/" });
        }
      } catch (error) {
        if (error instanceof Error) {
          setApiError(error.message);
        }
      }
    },
  });

  return (
    <AuthLayout>
      <div className="mb-8 text-center">
        <h1 className="font-mono text-4xl font-bold bg-linear-to-r from-neon-pink via-neon-purple to-neon-cyan bg-clip-text text-transparent">
          TALKBOX
        </h1>
        <p className="mt-2 text-sm text-gray-400">Create your account</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field name="username">
          {(field) => (
            <>
              <Label htmlFor={field.name}>USERNAME</Label>
              <Input
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="your username"
              />
              <ErrorMessage message={field.state.meta.errors[0]?.message} />
            </>
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <>
              <Label htmlFor={field.name}>EMAIL</Label>
              <Input
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="you@example.com"
              />
              <ErrorMessage message={field.state.meta.errors[0]?.message} />
            </>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <>
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
            </>
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? "..." : "REGISTER"}
            </Button>
          )}
        </form.Subscribe>

        <ErrorMessage message={apiError} />
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-neon-cyan hover:text-neon-pink transition-colors"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
