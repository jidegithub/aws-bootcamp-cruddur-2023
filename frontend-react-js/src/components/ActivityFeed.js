import './ActivityFeed.css';
import ActivityItem from './ActivityItem';

export default function ActivityFeed(props) {

  if (props.activities.length === 0){
    <div className='activity_feed_primer'>
      <span>Nothing to see here yet</span>
    </div>
  }

  return (
    <div className='activity_feed'>
      <div className='activity_feed_heading'>
        <div className='title'>{props.title}</div>
      </div>
      <div className='activity_feed_collection'>
        {props.activities.map((activity,i) => {
        return  <ActivityItem setReplyActivity={props.setReplyActivity} setPopped={props.setPopped} key={activity.uuid+i} activity={activity} />
        })}
      </div>
    </div>
  );
}