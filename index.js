const pgp = require('pg-promise')();
const connectionString = process.env.PG_CONN_STRING;
const db = pgp(connectionString);
let fs = require('fs');

console.log()
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function makeSqlRow(date_do1,du_date,idUnit){
  if(du_date == null){
    return `update
      operation.operation_unit_link
    set
      du_date = null,
      date_do1 = '${date_do1? new Date(date_do1).toLocaleString(): null}'
    where
      operation.operation_unit_link.id_unit = ${idUnit};
    `;
  }  

  if(date_do1 == null){
    return `update
      operation.operation_unit_link
    set
      du_date = '${du_date? new Date(du_date).toLocaleString(): null}',
      date_do1 = null
    where
      operation.operation_unit_link.id_unit = ${idUnit};
    `;
  }

  return `update
    operation.operation_unit_link
  set
    du_date = '${du_date? new Date(du_date).toLocaleString(): null}',
    date_do1 = '${date_do1? new Date(date_do1).toLocaleString(): null}'
  where
    operation.operation_unit_link.id_unit = ${idUnit};
  `;
}

async function updateLinks (){
  try{
    const unitsData = await db.query('select id, du_date, date_do1 from operation.unit where du_date is not null or date_do1 is not null');
    const unitsLength = Math.ceil(unitsData.length);

    for (i = 0; i < unitsLength; i++ ) {
      fs.appendFileSync(`file1.sql`,makeSqlRow(unitsData[i].date_do1,unitsData[i].du_date,unitsData[i].id))
    }
  } catch (error) {
    console.log(error);
    console.log(error.where);
  } finally {
    pgp.end(); // Закрываем соединение, когда закончим
  }
}

updateLinks();