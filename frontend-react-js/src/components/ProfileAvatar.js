import './ProfileAvatar.css';

export default function ProfileAvatar(props) {
  const backgroundImage = `url("https://d14trefe5nds05.cloudfront.net/avatars/processed/${props.id}.jpg")`;
  const styles = {
    backgroundImage: backgroundImage,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div 
      className="profile-avatar"
      style={styles}
    ></div>
  );
}