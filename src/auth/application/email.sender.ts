import dotenv from "dotenv";

dotenv.config();

type RegistrationEmailPayload = {
    email: string;
    confirmationUrl: string;
};

const MAILTRAP_API_URL = "https://send.api.mailtrap.io/api/send";

const ensureConfiguration = () => {
    const apiToken = process.env.MAILTRAP_API_TOKEN;
    const fromEmail = process.env.MAILTRAP_FROM_EMAIL;
    const fromName = process.env.MAILTRAP_FROM_NAME ?? "";

    if (!apiToken || !fromEmail) {
        console.warn("Mailtrap email configuration is missing. Email will not be sent.");
        return null;
    }

    return {apiToken, fromEmail, fromName};
};

const sendRequest = async (body: Record<string, unknown>, apiToken: string) => {
    const response = await fetch(MAILTRAP_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
            `Mailtrap responded with status ${response.status} ${response.statusText || ""}${
                errorText ? `: ${errorText}` : ""
            }`.trim(),
        );
    }
};

const buildRegistrationHtml = (confirmationUrl: string) => {
    return `
<h1>Thank for your registration</h1>
<p>To finish registration please follow the link below:
    <a href='${confirmationUrl}'>complete registration</a>
</p>
`.trim();
};

export const EmailSender = {
    async sendRegistrationEmail(data: RegistrationEmailPayload): Promise<void> {
        const configuration = ensureConfiguration();
        if (!configuration) {
            return;
        }

        const emailBody = {
            from: {
                email: configuration.fromEmail,
                name: configuration.fromName || undefined,
            },
            to: [{email: data.email}],
            subject: "Finish your registration",
            html: buildRegistrationHtml(data.confirmationUrl),
        };

        try {
            await sendRequest(emailBody, configuration.apiToken);
        } catch (error) {
            console.error("Failed to send registration email via Mailtrap", error);
        }
    },
};
