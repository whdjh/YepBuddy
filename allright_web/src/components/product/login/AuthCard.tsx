import Logo from '@/asset/ic/ic_logo.svg';

export default function AuthCard() {

  return (
    <div>
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-[2.5rem]">
          <Logo width={271} height={150} />
          <div className="flex w-full max-w-[31.875rem] flex-col items-center justify-center rounded-[1.5rem] bg-[#242429] px-[1rem] py-[2rem]">
            <h1 className="mb-[2rem]">
              로그인
            </h1>
            <div>아이디 추가</div>
            <div>비밀번호 추가</div>
            <div>버튼 영역</div>
            <div>여긴 카카오톡 버튼 영역</div>
          </div>
        </div>
      </div>
    </div>
  );
}