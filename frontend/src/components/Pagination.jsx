import Pagination from 'react-bootstrap/Pagination';

const NPagination = ({total, onItemClick, active = 1}) => {
    let items = [];
    for (let number = 0; number < total; number++) {
        const page = number + 1;
        let idx = Math.floor(Math.random()*1000) + Math.floor(Math.random()*1000).toString().concat(number.toString());

        const e =
            <Pagination.Item onClick={e => onItemClick(number)} key={idx} active={number === active}>
            {page}
            </Pagination.Item>;

        if(total < 10){
            items.push(e)
        }
        else{
            if(Math.abs(number - active) == 3){
                items.push(<Pagination.Ellipsis key={idx} />)
            }
            else if(Math.abs(number - active) < 3 || number%10 == 0){
                items.push(e)
            }
        }


    }

    return (
        <>
            <div>
                <Pagination>
                    {items}
                </Pagination>
            </div>
        </>
    )
}
export default NPagination;
