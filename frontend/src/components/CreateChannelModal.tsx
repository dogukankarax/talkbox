import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";

import { createChannel } from "@/lib/api";
import { CreateChannelSchema } from "@talkbox/shared";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CreateChannelModal({ isOpen, onClose }: Props) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [createdInviteCode, setCreatedInviteCode] = useState("");
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onChange: CreateChannelSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const result = await createChannel(value.name);
        setCreatedInviteCode(result.invite_code);
        queryClient.invalidateQueries({ queryKey: ["channels"] });
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
        {createdInviteCode ? "CHANNEL CREATED" : "NEW CHANNEL"}
      </h2>

      {createdInviteCode ? (
        <div className="space-y-4">
          <p className="text-gray-300 text-center">
            Share this invite code with others:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-lg text-neon-cyan bg-bg-deep/50 px-4 py-3 rounded-lg border border-neon-purple/20">
              {createdInviteCode}
            </code>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(createdInviteCode);
                toast.success("Invite code copied!");
              }}
              className="w-auto! px-4"
            >
              COPY
            </Button>
          </div>
          <Button
            onClick={() => {
              setCreatedInviteCode("");
              form.reset();
              onClose();
            }}
          >
            DONE
          </Button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field name="name">
            {(field) => (
              <div>
                <Label htmlFor={field.name}>CHANNEL NAME</Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="e.g., general"
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
                {isSubmitting ? "..." : "CREATE"}
              </Button>
            )}
          </form.Subscribe>

          <ErrorMessage message={apiError} />
        </form>
      )}
    </Modal>
  );
}
