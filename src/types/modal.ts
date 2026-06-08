export const ModalType = {} as const;

export type ModalType = (typeof ModalType)[keyof typeof ModalType];

export type ModalComponentType<_T extends ModalType> = never;

export type ModalData<_T extends ModalType> = never;

export interface ModalState<T extends ModalType | undefined> {
  type: T;
  data?: T extends undefined ? undefined : ModalData<NonNullable<T>>;
}
