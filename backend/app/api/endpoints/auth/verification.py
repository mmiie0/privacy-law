import secrets
import aiosmtplib 
import redis.asyncio as redis
from email.message import EmailMessage 

from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException, status

from app.db.rdb import get_rdb
from app.db.redis import get_redis
from app.core.config import settings 
from app.schemas.user_schema import User
from app.schemas.verification_schema import SendVerificationCodeRequest, SendVerificationCodeResponse


app = FastAPI(prefix="/verification-code", tags=["Verification-Code"])

AUTHINFO_EXPIRE_SECONDS = 300   # 인증 번호 유효 시간
AUTH_MAX_ATTEMPTS = 5         # 최대 시도 횟수
COOLDOWN_EXPIRE_SECONDS = 60  # 재전송 쿨타임


@router.post("/send", response_model=SendVerificationCodeResponse, status_code=status.HTTP_200_OK)
async def send_verification_code(
    body: SendVerificationCodeRequest, 
    db: AsyncSession = Depends(get_rdb), 
    r: redis.Redis = Depends(get_redis)
) -> SendVerificationCodeResponse:
    
    email = body.email
    
    # 동일한 이메일로 1분에 한 번 전송 가능   
    await checkCooldown(r, email)
        
    # 회원 가입 여부 확인
    user_exists = await isRegisteredEmail(db, email)
    
    # 인증번호 생성
    auth_number = "".join([str(secrets.randbelow(10)) for _ in range(6)])
    
    # 메일 발송
    if user_exists:
        await send_verification_email(
            email_to=email,
            subject="[PrivacyLaw AI] 인증 번호를 확인해주세요",
            code=auth_number,
            status="normal"
        )
    else:
        await send_verification_email(
            email_to=email,
            subject="[PrivacyLaw AI] 비정상적인 인증 요청이 감지되었습니다",
            code=auth_number,
            status="abnormal"
        )

    # 인증 번호, 시도 횟수 저장
    auth_info = f"auth:{email}"
    auth_data = {
        "code": auth_number,
        "attempts": 0 
    }
    r.setex(auth_info, AUTHINFO_EXPIRE_SECONDS, "1")  

    return SendVerificationCodeResponse(status="EMAIL_SENT_SUCCESS")


async def checkCooldown(r: redis, email: str) -> None:
    cooldown = f"cooldown:{email}"

    if await r.exists(cooldown):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        )

    r.setex(cooldown, COOLDOWN_EXPIRE_SECONDS, "1")  
    

async def isRegisteredEmail(db: AsyncSession, email: str) -> bool:
    query = select(User).where(User.email == email)
    result = await db.execute(query)
    user_exists = result.scalar_one_or_none()
    
    if user_exists:
        return True
    else:
        return False
    

async def send_verification_email(email_to: str, subject: str, code: str, status: str):
    message = EmailMessage()
    message["From"] = settings.SMTP_USER
    message["To"] = email_to
    message["Subject"] = subject
    
    body = get_email_body(status)

    message.add_alternative(body, subtype='html')
    
    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            use_tls=True,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    

async def get_email_body(code: str, status: str) -> str:
    if status == "normal":
        return f"""
                <html>
                <body style="margin:0; padding:0; background-color:#f6f8fa; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">
                    <div style="width:100%; padding:40px 0; text-align:center;">
                    <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:6px; border:1px solid #e1e4e8; padding:32px 40px; text-align:left;">
                        <h2 style="margin:0 0 8px 0; font-size:20px; font-weight:600;">
                        [PrivacyLaw AI] 본인 확인을 위한 인증번호
                        </h2>
                        <p style="margin:0 0 24px 0; font-size:14px; color:#586069;">
                        아래 인증번호를 입력하여 본인 인증을 완료해 주세요.
                        </p>

                        <p style="margin:0 0 8px 0; font-size:14px;">
                        요청하신 인증번호는 다음과 같습니다:
                        </p>

                        <div style="
                        font-size:32px;
                        font-weight:600;
                        letter-spacing:4px;
                        text-align:center;
                        margin:20px 0 24px 0;
                        padding:18px 0;
                        border-radius:6px;
                        border:1px solid #e1e4e8;
                        background-color:#f9fafb;
                        ">
                        {code}
                        </div>

                        <p style="margin:0 0 4px 0; font-size:14px; color:#24292e;">
                        이 코드는 <strong>5분간만 유효</strong>하며, 한 번만 사용할 수 있습니다.
                        </p>
                        <p style="margin:4px 0 16px 0; font-size:13px; color:#586069;">
                        <strong>이 코드를 다른 사람과 절대 공유하지 마세요.</strong><br>
                        PrivacyLaw AI는 전화나 이메일로 인증번호 입력을 요청하지 않습니다.
                        </p>

                        <p style="margin:0; font-size:13px; color:#586069;">
                        회원님이 요청한 것이 아니라면 이 메일을 무시해 주세요.
                        </p>

                        <p style="margin:24px 0 0 0; font-size:13px; color:#586069;">
                        감사합니다.<br>
                        <strong>PrivacyLaw AI 팀 드림</strong>
                        </p>
                    </div>

                    <p style="margin:16px 0 0 0; font-size:12px; color:#8a94a6;">
                        이 이메일은 PrivacyLaw AI 서비스에서 인증번호 발급 요청이 발생하여 전송되었습니다.
                    </p>
                    </div>
                </body>
                </html>
                """
    else:
        return """
                <html>
                <body style="margin:0; padding:0; background-color:#f6f8fa; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">
                    <div style="width:100%; padding:40px 0; text-align:center;">
                    <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:6px; border:1px solid #e1e4e8; padding:32px 40px; text-align:left;">
                        <h2 style="margin:0 0 8px 0; font-size:20px; font-weight:600;">
                        [PrivacyLaw AI] 비정상적인 인증 요청이 감지되었습니다
                        </h2>

                        <p style="margin:0 0 16px 0; font-size:14px; color:#586069;">
                        회원님의 이메일 주소를 사용한 <strong>회원가입 또는 비밀번호 재설정 요청</strong>이 감지되었지만,
                        아래 사유로 인해 정상적으로 처리되지 않았습니다.
                        </p>

                        <ul style="margin:0 0 16px 18px; padding:0; font-size:13px; color:#586069;">
                        <li>이미 가입된 이메일로 회원가입을 시도한 경우</li>
                        <li>가입되지 않은 이메일로 비밀번호 재설정을 시도한 경우</li>
                        </ul>

                        <p style="margin:0 0 12px 0; font-size:13px; color:#586069;">
                        회원님이 직접 시도하신 것이 아니라면, 누군가 이메일 주소를 잘못 입력했거나
                        제3자가 회원님의 이메일을 사용하여 접근을 시도했을 수 있습니다.
                        </p>

                        <p style="margin:0 0 12px 0; font-size:13px; color:#586069;">
                        본인이 요청하지 않으신 경우, 별도의 추가 조치는 필요하지 않으며
                        이 메일은 상황 안내를 위해 발송되었습니다.
                        </p>

                        <p style="margin:0 0 12px 0; font-size:13px; color:#586069;">
                        다만, 다른 서비스에서 동일한 이메일과 비밀번호 조합을 사용 중이시라면,
                        보안을 위해 비밀번호 변경을 권장드립니다.
                        </p>

                        <p style="margin:24px 0 0 0; font-size:13px; color:#586069;">
                        감사합니다.<br>
                        <strong>PrivacyLaw AI 팀 드림</strong>
                        </p>
                    </div>

                    <p style="margin:16px 0 0 0; font-size:12px; color:#8a94a6;">
                        이 이메일은 PrivacyLaw AI 서비스에서 회원님의 이메일 주소로
                        회원가입 또는 비밀번호 재설정 요청이 발생하여 발송되었습니다.
                        본인이 요청하지 않으셨다면 이 메일을 무시하셔도 됩니다.
                    </p>
                    </div>
                </body>
                </html>
                """
