import os
import smtplib
from email.mime.text import MIMEText


def send_email(subject: str, body: str, to_addr: str):
    """
    Envía un correo de texto plano.
    Si algo falla (credenciales malas, sin internet, etc.), lanza excepción.
    """

    smtp_host = os.getenv("SMTP_HOST")         # ej: "smtp.gmail.com"
    smtp_port = os.getenv("SMTP_PORT")         # ej: "587"
    smtp_user = os.getenv("SMTP_USER")         # correo remitente
    smtp_pass = os.getenv("SMTP_PASS")         # contraseña/app password
    from_addr = os.getenv("SMTP_FROM") or smtp_user  # quién aparece como remitente

    if not (smtp_host and smtp_port and smtp_user and smtp_pass and from_addr):
        raise RuntimeError("Config SMTP incompleta, revisa variables de entorno")

    # armamos el correo
    msg = MIMEText(body, _charset="utf-8")
    msg["Subject"] = subject
    msg["From"] = from_addr
    msg["To"] = to_addr

    # enviamos
    with smtplib.SMTP(smtp_host, int(smtp_port)) as server:
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.sendmail(from_addr, [to_addr], msg.as_string())