import MyProfile from "@/components/module/MyProfile/MyProfile";
import { getUserInfo } from "@/services/auth/getUserInfo";

const MyProfilePage = async () => {
  const userInfo = await getUserInfo();
  console.log(userInfo);
  
  return <MyProfile userInfo={userInfo} />;
};

export default MyProfilePage;