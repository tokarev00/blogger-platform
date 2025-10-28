import https from "https";
import dotenv from "dotenv";

dotenv.config();

type RegistrationEmailPayload = {
    email: string;
    confirmationUrl: string;
};

const RESEND_API_URL = "https://api.resend.com/emails";

const ensureConfiguration = () => {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;

    if (!apiKey || !from) {
        console.warn("Resend email configuration is missing. Email will not be sent.");
        return null;
    }

    return {apiKey, from};
};

const sendRequest = async (body: Record<string, unknown>, apiKey: string) => {
    const payload = JSON.stringify(body);

    await new Promise<void>((resolve, reject) => {
        const request = https.request(
            RESEND_API_URL,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Length": Buffer.byteLength(payload).toString(),
                },
            },
            (response) => {
                // Consume response data to free up memory
                response.on("data", () => {});
                response.on("end", () => {
                    if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
                        resolve();
                    } else {
                        const status = response.statusCode ?? "unknown";
                        reject(new Error(`Resend responded with status ${status}`));
                    }
                });
            },
        );

        request.on("error", (error) => reject(error));
        request.write(payload);
        request.end();
    });
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
            from: configuration.from,
            to: [data.email],
            subject: "Finish your registration",
            html: buildRegistrationHtml(data.confirmationUrl),
        };

        try {
            await sendRequest(emailBody, configuration.apiKey);
        } catch (error) {
            console.error("Failed to send registration email via Resend", error);
        }
    },
};
