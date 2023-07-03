import './FormErrors.css';
import FormErrorItem from 'components/FormErrorItem';

export default function FormErrors(props) {
  // console.log("form error",props)
  let el_errors = props?.error

  // if (props.errors.length > 0) {
  //   el_errors = (<div className='errors'>
  //     {props.errors.map(err_code => {
  //       return <FormErrorItem err_code={err_code} />
  //     })}
  //   </div>)
  // }
  
  // useEffect(() => {

  // }, [])

  return (
    <div className='errorsWrap'>
      {el_errors ? <FormErrorItem err_code={el_errors} /> : null}
    </div>
  )
}