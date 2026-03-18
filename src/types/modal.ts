export const ModalType = {
  test: "test",
} as const;

export type ModalType = (typeof ModalType)[keyof typeof ModalType];
