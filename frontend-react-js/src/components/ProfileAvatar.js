import './ProfileAvatar.css';

export default function ProfileAvatar(props) {
  // const backgroundImage = `url("https://assets.jidecruddur.site/avatars/${props.id}.jpg")`;
  const backgroundImage = `url("https://picsum.photos/id/40/200/300")`;
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