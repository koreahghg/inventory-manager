"use client";

import type { ReactNode } from "react";
import { RegisterLogisticsForm } from "./register/ui";

export function LogisticsGateContent({
  hasRegistration,
  onRegistered,
  onCancel,
  title,
  children,
}: {
  hasRegistration: boolean;
  onRegistered: () => void;
  onCancel: () => void;
  title: string;
  children: ReactNode;
}) {
  if (hasRegistration) {
    return (
      <>
        <h2 className="mb-4 text-title-1 font-bold text-grey-900">{title}</h2>
        {children}
      </>
    );
  }

  return (
    <>
      <h2 className="mb-2 text-title-1 font-bold text-grey-900">물류 코드 등록이 필요해요</h2>
      <p className="mb-4 text-body-2 text-grey-500">
        매입을 시작하려면 물류 코드를 먼저 등록해야 합니다. 한 번 등록하면
        그 뒤로는 계속 매입할 수 있어요.
      </p>
      <RegisterLogisticsForm onSuccess={onRegistered} onCancel={onCancel} />
    </>
  );
}
