import React, { Component } from 'react';
import { storiesOf, action, linkTo } from '@kadira/storybook';
import withContext from 'recompose/withContext';
import { connect } from 'react-redux';

import Griddle from '../src/index';
import Cell from '../src/components/Cell';
import Row from '../src/components/Row';
import TableBody from '../src/components/TableBody';
import TableHeadingCell from '../src/components/TableHeadingCell';
import TableHeading from '../src/components/TableHeading';
import { Table } from '../src/components/Table';
import TableContainer from '../src/components/TableContainer';
import ColumnDefinition from '../src/components/ColumnDefinition';
import RowDefinition from '../src/components/RowDefinition';
import _ from 'lodash';
import { rowDataSelector } from '../src/plugins/local/selectors/localSelectors';
import fakeData from './fakeData';
import {fakeData2, fakeData3} from './fakeData2';

import LocalPlugin from '../src/plugins/local';
import PositionPlugin from '../src/plugins/position';

function sortBySecondCharacter(data, column, sortAscending = true) {
  return data.sort(
    (original, newRecord) => {
      original = (!!original.get(column) && original.get(column)) || "";
      newRecord = (!!newRecord.get(column) && newRecord.get(column)) || "";

      if(original[1] === newRecord[1]) {
        return 0;
      } else if (original[1] > newRecord[1]) {
        return sortAscending ? 1 : -1;
      }
      else {
        return sortAscending ? -1 : 1;
      }
    });
}

// from mdn
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFakeData() {
  const start = getRandomIntInclusive(0, fakeData.length - 10);
  return fakeData.slice(start, start + 10);
}
const GreenLeftSortIconComponent = (props) => (
  <span style={{ color: "#00ff00" }}>
    {props.icon && <span>{props.icon}</span>}
    {props.title}
  </span>
)

const MakeBlueComponent = (props) => (
  <div style={{backgroundColor: '#0000FF'}}>
    {props.value}
    {props.rowData &&
      <small style={{ marginLeft: 5, opacity: .5}}>{props.rowData.company}</small>}
  </div>
)

const EnhanceWithRowData = connect((state, props) => ({
  rowData: rowDataSelector(state, props)
}));

const EnhancedCustomComponent = EnhanceWithRowData(MakeBlueComponent);

storiesOf('Griddle main', module)
  .add('with local', () => {
    return (
      <Griddle data={fakeData} plugins={[LocalPlugin]}>
        <RowDefinition>
        </RowDefinition>
      </Griddle>
    )
  })
  .add('with local and events', () => {

    // don't do things this way - fine for example storybook
    const events = {
      onFilter: () => console.log('onFilter'),
      onSort: () => console.log('onSort'),
      onNext: () => console.log('onNext'),
      onPrevious: () => console.log('onPrevious'),
      onGetPage: () => console.log('onGetPage')
    }

    return (
      <Griddle data={fakeData} plugins={[LocalPlugin]} events={events}>
        <RowDefinition>
        </RowDefinition>
      </Griddle>
    )
  })
  .add('with local and sort set', () => {
    const sortProperties = [
      { id: 'name', sortAscending: true }
    ];

    return (
      <Griddle data={fakeData} plugins={[LocalPlugin]} sortProperties={sortProperties}>
        <RowDefinition>
        </RowDefinition>
      </Griddle>
    )
  })

  .add('with custom sort on name', () => {
    return (
      <div>
      <small>Sorts name by second character</small>
      <Griddle data={fakeData} plugins={[LocalPlugin]}>
        <RowDefinition>
          <ColumnDefinition id="name" order={2} title="NAME" sortMethod={sortBySecondCharacter} />
          <ColumnDefinition id="state" order={1} />
        </RowDefinition>
      </Griddle>
      </div>
    );
  })
  .add('with custom component on name', () => {
    return (
      <div>
        <small>Everything in the name column should be blue</small>
       <Griddle data={fakeData} plugins={[LocalPlugin]}>
        <RowDefinition>
          <ColumnDefinition id="name" order={2} customComponent={MakeBlueComponent} width={800}/>
          <ColumnDefinition id="state" order={1} width={100}/>
        </RowDefinition>
      </Griddle>
      </div>
    )
  })
  .add('with \'connected\' custom component', () => {
     return (
      <div>
        <small>Everything in the name column should be blue and we should now see the company name also</small>
       <Griddle data={fakeData} plugins={[LocalPlugin]}>
        <RowDefinition>
          <ColumnDefinition id="name" order={2} customComponent={EnhancedCustomComponent} />
          <ColumnDefinition id="state" order={1} />
        </RowDefinition>
      </Griddle>
      </div>
    )
  })
  .add('with controlled griddle component', () => {

    class Something extends React.Component {
      constructor() {
        super();

        this.state = {
          data: getRandomFakeData(),
          sortProperties: {}
        };
      }

      onFilter = (filter) => {
        console.log('onFilter', filter);
        this.setState({ data: getRandomFakeData() })
      }

      onSort = (sortProperties) => {
        console.log('onSort', sortProperties);
        this.setState({
          data: getRandomFakeData(),
          sortProperties: {
            something: {
              ...sortProperties,
              sortAscending: getRandomIntInclusive(0,1) > 0 ? true : false
            }
          }
         })
      }

      onNext = () => {
        console.log('onNext');
        this.setState({ data: getRandomFakeData() })
      }

      onPrevious = () => {
        console.log('onPrevious');
        this.setState({ data: getRandomFakeData() })
      }

      onGetPage = (pageNumber) => {
        console.log('onGetPage', pageNumber);
        this.setState({ data: getRandomFakeData() })
      }

      render() {
        const pageProperties = {
          currentPage: getRandomIntInclusive(1, 10),
          recordCount: getRandomIntInclusive(1, 1000)
        }

        // don't do things this way - fine for example storybook
        const events = {
          onFilter: this.onFilter,
          onSort: this.onSort,
          onNext: this.onNext,
          onPrevious: this.onPrevious,
          onGetPage: this.onGetPage
        }

        return <Griddle
          data={this.state.data}
          events={events}
          styleConfig={{
            classNames:{
              Cell: 'hahaha',
            },
          }}
          sortProperties={this.state.sortProperties}
          pageProperties={pageProperties}>
            <RowDefinition>
              <ColumnDefinition id="name" width={500} style={{ color: "#FAB" }} />
              <ColumnDefinition id="state" />
            </RowDefinition>
          </Griddle>
      }
    }

    return <Something />
  })
  .add('with controlled griddle component with no results', () => {
    return <Griddle data={[]} />
  })
  .add('with custom heading component', () => {
    return (
      <div>
        <small>Name should have a green heading component -- sort icon should show up on the left of the title</small>
       <Griddle data={fakeData} plugins={[LocalPlugin]}>
        <RowDefinition>
          <ColumnDefinition id="name" order={2} customHeadingComponent={GreenLeftSortIconComponent} />
          <ColumnDefinition id="state" order={1} />
        </RowDefinition>
      </Griddle>
      </div>
    )
  })
  .add('with override row component', () => {
    const NewRow = (props) => <tr><td>hi</td></tr>

    return <Griddle
      data={fakeData}
      components={{
        Row: NewRow
      }}
    />
  })
  .add('with virtual scrolling', () => {
    return (
      <Griddle data={fakeData} plugins={[LocalPlugin, PositionPlugin({ tableHeight: 300 })]}>
        <RowDefinition>
          <ColumnDefinition id="name" order={2} customHeadingComponent={GreenLeftSortIconComponent} width={300} />
          <ColumnDefinition id="state" order={1} width={400} />
        </RowDefinition>
      </Griddle>
    )
  })
  .add('set fakeData to constructed Objects', () => {
    return (
      <Griddle data={fakeData2} plugins={[LocalPlugin]}>
        <RowDefinition>
        </RowDefinition>
      </Griddle>
    )
  })
  .add('set fakeData to class Objects', () => {
    return (
      <Griddle data={fakeData3} plugins={[LocalPlugin]}>
        <RowDefinition>
        </RowDefinition>
      </Griddle>
    )
  })
  .add('with nested column data', () => {
    const localData = [
      {
        "id": 0,
        "name": "Mayer Leonard",
        "location": {
          "country": "United Kingdom",
          "city": "Kapowsin",
          "state": "Hawaii",
        },
        "company": "Ovolo",
        "favoriteNumber": 7
      },
      {
        "id": 1,
        "name": "Koch Becker",
        "location": {
          "city": "Johnsonburg",
          "state": "New Jersey",
          "country": "Madagascar",
        },
        "company": "Eventage",
        "favoriteNumber": 2
      },
      {
        "id": 2,
        "name": "Lowery Hopkins",
        "location": {
          "city": "Blanco",
          "state": "Arizona",
          "country": "Ukraine",
        },
        "company": "Comtext",
        "favoriteNumber": 3
      },
      {
        "id": 3,
        "name": "Walters Mays",
        "location": {
          "city": "Glendale",
          "state": "Illinois",
          "country": "New Zealand",
        },
        "company": "Corporana",
        "favoriteNumber": 6
      },
      {
        "id": 4,
        "name": "Shaw Lowe",
        "location": {
          "city": "Coultervillle",
          "state": "Wyoming",
          "country": "Ecuador",
        },
        "company": "Isologica",
        "favoriteNumber": 2
      },
      {
        "id": 5,
        "name": "Ola Fernandez",
        "location": {
          "city": "Deltaville",
          "state": "Delaware",
          "country": "Virgin Islands (US)",
        },
        "company": "Pawnagra",
        "favoriteNumber": 7
      },
    ];

    return (
      <Griddle data={localData} plugins={[LocalPlugin]}>
        <RowDefinition>
          <ColumnDefinition id="name" />
          <ColumnDefinition id="location.state" nested={true}/>
        </RowDefinition>
      </Griddle>
    );
  })

storiesOf('Cell', module)
  .add('base cell', () => {
    const someValue = "hi from storybook"

    return <table>
      <tbody>
        <tr>
          <Cell value={someValue}
            className="someClass"
            style={{ fontSize: 20, color: "#FAB" }}
            onClick={() => console.log('clicked')}
            onMouseOver={() => console.log('mouse over')}
            onMouseOut={() => console.log('mouse out')}
          />
      </tr>
      </tbody>
    </table>
  })
  .add('CellContainer', () => {
    return (
      <Griddle data={fakeData} plugins={[LocalPlugin]}>
        <RowDefinition>
          <ColumnDefinition id="name" order={2} />
          <ColumnDefinition id="state" order={1} />
        </RowDefinition>
      </Griddle>);
  });

storiesOf('Bug fixes', module)
  .add('Add data', () => {
    class FixContainer extends Component {
      state = { data: fakeData.slice(0, 5)}

      onClick = () => {
        const data = this.state.data.concat(fakeData.slice(6, 7));
        this.setState({ data });
      }

      render() {
        return (
          <div>
            <button onClick={this.onClick} type='button'>Click</button>
            <Griddle data={this.state.data} plugins={[LocalPlugin]} />
          </div>
        );
      }
    }

    return (
      <FixContainer />
    );
  })
  .add('Delete row', () => {
     const enhanceWithOnClick = onClick => class ComputeThing extends Component {
      static propTypes = {
        rowData: React.PropTypes.object.isRequired,
      }

      localClick = () => {
        const { id } = this.props.rowData;

        onClick(id);
      }

      render() {
        const { rowData: { id } } = this.props;

        return (
          <button type='button' onClick={this.localClick}>
            Remove {id}
          </button>
        )
       }
     }


    class SomeComponent extends Component {
      constructor(props) {
        super(props);

        this.state = {
           data: [
            {
              "id": 0,
              "name": "Mayer Leonard",
              "country": "United Kingdom",
              "city": "Kapowsin",
              "state": "Hawaii",
              "company": "Ovolo",
              "favoriteNumber": 7
            },
            {
              "id": 1,
              "name": "Koch Becker",
              "city": "Johnsonburg",
              "state": "New Jersey",
              "country": "Madagascar",
              "company": "Eventage",
              "favoriteNumber": 2
            },
            {
              "id": 2,
              "name": "Lowery Hopkins",
              "city": "Blanco",
              "state": "Arizona",
              "country": "Ukraine",
              "company": "Comtext",
              "favoriteNumber": 3
            },
            {
              "id": 3,
              "name": "Walters Mays",
              "city": "Glendale",
              "state": "Illinois",
              "country": "New Zealand",
              "company": "Corporana",
              "favoriteNumber": 6
            },
            {
              "id": 4,
              "name": "Shaw Lowe",
              "city": "Coultervillle",
              "state": "Wyoming",
              "country": "Ecuador",
              "company": "Isologica",
              "favoriteNumber": 2
            },
            {
              "id": 5,
              "name": "Ola Fernandez",
              "city": "Deltaville",
              "state": "Delaware",
              "country": "Virgin Islands (US)",
              "company": "Pawnagra",
              "favoriteNumber": 7
            },
          ]
        }

        this.Component = EnhanceWithRowData(enhanceWithOnClick(this.onRemove));

      }

      onRemove = (rowId) => {
        const newData = this.state.data.filter(x => x.id !== rowId);
        this.setState({data: newData});
      }

      render() {
        return (
          <Griddle data={this.state.data} plugins={[LocalPlugin]}>
            <RowDefinition>
              <ColumnDefinition id="id" />
              <ColumnDefinition id="name" />
              <ColumnDefinition id="somethingTotallyMadeUp" title="Compute thing" customComponent={this.Component} />
            </RowDefinition>
          </Griddle>
        );
       }
     }

    return (
      <SomeComponent />
    );
})

storiesOf('Row', module)
  .add('base row', () => {
    const cells = [
      <td>One</td>,
      <td>Two</td>,
      <td>Three</td>
    ];

    return (
      <table>
        <tbody>
          <Row
            cells={cells}
            onClick={() => console.log('clicked')}
            onMouseOver={() => console.log('mouse over')}
            onMouseOut={() => console.log('mouse out')}
          />
        </tbody>
      </table>
    )
  })
  .add('with local plugin container', () => {
    const testPlugin = {
      components: {
        Cell: ({griddleKey, columnId}) => <td>{`${griddleKey} ${columnId}`}</td>
      }
    };

    return (
      <Griddle data={fakeData} plugins={[LocalPlugin, testPlugin]}>
        <RowDefinition>
          <ColumnDefinition id="name" order={2} />
          <ColumnDefinition id="state" order={1} />
        </RowDefinition>
      </Griddle>
    )
  })

storiesOf('TableBody', module)
  .add('base table body', () => {
    const rowIds = [1,2,3];

    const FakeRow = ({griddleKey}) => <tr><td>Row id: {griddleKey}</td></tr>;

    return (
      <table>
        <TableBody rowIds={rowIds} Row={FakeRow} />
      </table>
    )
  })
  .add('with local container', () => {
    const junkPlugin = {
      components: {
        Row: (props) => <tr><td>{props.griddleKey}</td></tr>,
        // override local row container
        RowContainer: original => props => original(props)
      }
    }

    return (
      <Griddle data={fakeData} plugins={[LocalPlugin, junkPlugin]}>
        <RowDefinition>
          <ColumnDefinition id="name" order={2} />
          <ColumnDefinition id="state" order={1} />
        </RowDefinition>
      </Griddle>
    )
  })

storiesOf('TableHeadingCell', module)
  .add('base table heading cell', () => {
    return (
      <table>
        <thead>
          <tr>
            <TableHeadingCell
              title="New Title"
              onClick={() => console.log('clicked')}
              onMouseOver={() => console.log('mouse over')}
              onMouseOut={() => console.log('mouse out')}
            />
          </tr>
        </thead>
      </table>
    )
  })

storiesOf('TableHeading', module)
  .add('base table heading', () => {
    const columnTitles = ['one', 'two', 'three'];

    return (
      <table>
        <TableHeading columnTitles={columnTitles} TableHeadingCell={TableHeadingCell} />
      </table>
    )
  })

storiesOf('Table', module)
  .add('base table', () => {
    const tableHeading = props => (
      <thead>
        <tr>
          <th>One</th>
          <th>Two</th>
          <th>Three</th>
        </tr>
      </thead>
    );

    const tableBody = props => (
      <tbody>
        <tr>
          <td>uno</td>
          <td>dos</td>
          <td>tres</td>
        </tr>
      </tbody>
    );

    return (
      <Table
        TableHeading={tableHeading}
        TableBody={tableBody}
      />
    );
  })

storiesOf('TableContainer', module)
  .add('base', () => {
    const tableHeading = (props) => (
      <thead>
        <tr>
          <th>One</th>
          <th>Two</th>
          <th>Three</th>
        </tr>
      </thead>
    );

    const tableBody = (props) => (
      <tbody>
        <tr>
          <td>uno</td>
          <td>dos</td>
          <td>tres</td>
        </tr>
      </tbody>
    );

    class BaseWithContext extends React.Component {
      static childContextTypes = {
        components: React.PropTypes.object.isRequired
      }

      getChildContext() {
        return {
          components: {
            TableBody: tableBody,
            TableHeading: tableHeading
          }
        };
      }

      render() {
        return (
          <div>
            {this.props.children}
          </div>
        );
      }
    }

    const TableComposed = TableContainer(Table);

    return (
      <BaseWithContext>
        <TableComposed />
      </BaseWithContext>
    );
  })
