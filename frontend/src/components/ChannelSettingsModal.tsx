import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";

import { deleteChannel, leaveChannel, updateChannel } from "@/lib/api";
import { UpdateChannelSchema } from "@talkbox/shared";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { LogOut, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  channelId: string;
  channelName: string;
  isAdmin: boolean;
};

export default function ChannelSettingsModal({
  isOpen,
  onClose,
  channelId,
  channelName,
  isAdmin,
}: Props) {
  const [apiError, setApiError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: { name: channelName },
    validators: { onChange: UpdateChannelSchema },
    onSubmit: async ({ value }) => {
      try {
        await updateChannel(channelId, value.name);
        queryClient.invalidateQueries({ queryKey: ["channels"] });
        onClose();
      } catch (error) {
        if (error instanceof Error) setApiError(error.message);
      }
    },
  });

  const handleDelete = () => {
    toast("Delete this channel?", {
      description: "This cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await deleteChannel(channelId);
            queryClient.invalidateQueries({ queryKey: ["channels"] });
            onClose();
            navigate({ to: "/channels" });
            toast.success("Channel deleted");
          } catch (error) {
            if (error instanceof Error) toast.error(error.message);
          }
        },
      },
    });
  };

  const handleLeave = () => {
    toast("Leave this channel?", {
      action: {
        label: "Leave",
        onClick: async () => {
          try {
            await leaveChannel(channelId);
            queryClient.invalidateQueries({ queryKey: ["channels"] });
            onClose();
            navigate({ to: "/channels" });
            toast.success("Left channel");
          } catch (error) {
            if (error instanceof Error) toast.error(error.message);
          }
        },
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="font-mono text-2xl font-bold text-center bg-linear-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent mb-6">
        CHANNEL SETTINGS
      </h2>

      {isAdmin && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4 mb-6"
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
                {isSubmitting ? "..." : "SAVE"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      )}

      <div className="space-y-2 pt-4 border-t border-neon-purple/20">
        <Button
          onClick={handleLeave}
          className="bg-linear-to-r! from-gray-600! to-gray-700! hover:from-neon-pink! hover:to-neon-purple!"
        >
          <LogOut className="w-4 h-4" />
          LEAVE CHANNEL
        </Button>

        {isAdmin && (
          <Button
            onClick={handleDelete}
            className="bg-linear-to-r! from-red-600! to-red-800! hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]!"
          >
            <Trash2 className="w-4 h-4" />
            DELETE CHANNEL
          </Button>
        )}
      </div>

      <ErrorMessage message={apiError} />
    </Modal>
  );
}
