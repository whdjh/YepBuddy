import Logo from '@/asset/ic/ic_logo.svg';
import Button from '@/components/common/Button';

export default function AuthCard() {

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-[2.5rem]">
        <div className="flex w-full max-w-[31.875rem] gap-[1rem] flex-col items-center justify-center rounded-[1.5rem] bg-[#242429] px-[1rem] py-[2rem]">
          <Logo height={120} />
          <div>아이디input</div>
          <div>비밀번호input</div>
          <Button variant="solid" className='w-[20.7rem]'>로그인</Button>
          <Button variant="outline" className='w-[20.7rem]'>카카오로그인(임시)</Button>
        </div>
      </div>
    </div>
  );
}