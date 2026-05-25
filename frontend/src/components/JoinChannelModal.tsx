import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";

import { joinChannel } from "@/lib/api";
import { JoinChannelSchema } from "@talkbox/shared";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function JoinChannelModal({ isOpen, onClose }: Props) {
  const [apiError, setApiError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      invite_code: "",
    },
    validators: {
      onChange: JoinChannelSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const result = await joinChannel(value.invite_code);
        queryClient.invalidateQueries({ queryKey: ["channels"] });
        onClose();
        navigate({
          to: "/channels/$channelId",
          params: { channelId: result.channelId },
        });
      } catch (error) {
        if (error instanceof Error) {
          setApiError(error.message);
        }
      }
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="font-mono text-2xl font-bold text-center bg-linear-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent mb-6">
        JOIN CHANNEL
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field name="invite_code">
          {(field) => (
            <>
              <Label htmlFor={field.name}>Invite Code: </Label>
              <Input
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
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
              {isSubmitting ? "..." : "JOIN"}
            </Button>
          )}
        </form.Subscribe>
        <ErrorMessage message={apiError} />
      </form>
    </Modal>
  );
}
