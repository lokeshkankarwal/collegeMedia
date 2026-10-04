interface SendResetEmailOptions {
    to: string;
    resetLink: string;
}
export declare const sendPasswordResetEmail: ({ to, resetLink, }: SendResetEmailOptions) => Promise<boolean>;
export {};
//# sourceMappingURL=email.service.d.ts.map