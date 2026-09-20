"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { LogisticsGateContent } from "@/features/logistics-registration/gate-content";
import { CreatePurchaseForm } from "./ui";

export function CreatePurchaseTrigger({
  hasLogisticsRegistration,
}: {
  hasLogisticsRegistration: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>새 매입 등록</Button>
      {open && (
        <Modal size={hasLogisticsRegistration ? "lg" : "sm"} onClose={close}>
          <LogisticsGateContent
            hasRegistration={hasLogisticsRegistration}
            title="새 매입 등록"
            onCancel={close}
            onRegistered={() => {
              close();
              router.refresh();
            }}
          >
            <CreatePurchaseForm onClose={close} />
          </LogisticsGateContent>
        </Modal>
      )}
    </>
  );
}
