import Logo from '@/asset/ic/ic_logo.svg';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

export default function AuthCard() {

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex w-full max-w-[30rem] gap-[2rem] flex-col items-center justify-center rounded-[1rem] bg-[#242429] px-[2rem] py-[2rem]">
        <Logo width={100} height={100} />
        <Input 
          name="id" 
          label="아이디" 
          placeholder='아이디를 입력해주세요.'
          width='w-[20rem]'
        />
        <Input 
          name="pwd" 
          label="비밀번호" 
          type="password" 
          placeholder='비밀번호를 입력해주세요.'
          width='w-[20rem]'
        />
        <Button variant="solid" className='w-[15rem]'>로그인</Button>
        <Button variant="kakao" className='w-[15rem]'>카카오로그인</Button>
      </div>
    </div>
  );
}