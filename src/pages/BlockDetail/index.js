import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, gql } from '@apollo/client'
import components from 'components'
import {
  formatHash,
  formatHexToInt,
  formatIntToHex,
  timestampToDate,
  numToFixed,
} from 'utils'
import moment from 'moment'
import { ethers } from 'ethers'

const GET_BLOCK = gql`
  query BlockByNumber($number: Long) {
    block(number: $number) {
      number
      transactionCount
      hash
      parent {
        hash
      }
      timestamp
      txList {
        hash
        from
        to
        value
        gasUsed
        block {
          number
          timestamp
        }
      }
    }
  }
`
export default function BlockDetail() {
  const params = useParams()
  const [block, setBlock] = useState([])
  const { loading, error, data } = useQuery(GET_BLOCK, {
    variables: {
      number: formatIntToHex(params.id),
    },
  })

  const columns = ['Tx Hash', 'Block', 'Time', 'From', 'To', 'Value', 'Txn Fee']

  useEffect(() => {
    if (data) {
      const edges = data.block
      setBlock(edges)
    }
  }, [data])
  return (
    <div>
      <components.TableView
        classes="w-screen max-w-5xl"
        title={`Block #${formatHexToInt(block.number)}`}
        dontNeedSubtitle={true}
      >
        <components.DynamicTable>
          {loading ? (
            <tr>
              <td>
                <components.Loading />
              </td>
            </tr>
          ) : (
            <>
              <tr>
                <td className="grid grid-flow-row-dense grid-cols-3 border-b p-3">
                  <div className="sm:block small text-secondary ml-1 ml-sm-0 text-nowrap">
                    Block Height:
                  </div>
                  <div class="col-span-2">
                    {formatHexToInt(block.number)}
                    <Link
                      className="bg-gray-200 text-blue-500 text-sm px-1 mx-1 font-extrabold"
                      to={`/blocks/${Number(formatHexToInt(block.number) - 1)}`}
                    >
                      {'<'}
                    </Link>
                    <Link
                      className="bg-gray-200 text-blue-500 text-sm px-1 font-extrabold"
                      to={`/blocks/${Number(formatHexToInt(block.number) + 1)}`}
                    >
                      {'>'}
                    </Link>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="grid grid-flow-row-dense grid-cols-3 border-b p-3">
                  <div className="sm:block small text-secondary ml-1 ml-sm-0 text-nowrap">
                    Timestamp:
                  </div>
                  <div class="col-span-2">
                    {moment.unix(block.timestamp).fromNow()}{' '}
                    {`(${timestampToDate(block.timestamp)})`}
                  </div>
                </td>
              </tr>
              <tr>
                <td className="grid grid-flow-row-dense grid-cols-3 border-b p-3">
                  <div className="sm:block small text-secondary ml-1 ml-sm-0 text-nowrap">
                    Transactions:
                  </div>
                  <div class="col-span-2">
                    {formatHexToInt(block.transactionCount)} transactions
                  </div>
                </td>
              </tr>
              <tr>
                <td className="grid grid-flow-row-dense grid-cols-3 border-b p-3">
                  <div className="sm:block small text-secondary ml-1 ml-sm-0 text-nowrap">
                    Block Hash:
                  </div>
                  <div class="col-span-2">{block.hash}</div>
                </td>
              </tr>
              <tr>
                <td className="grid grid-flow-row-dense grid-cols-3 border-b p-3">
                  <div className="sm:block small text-secondary ml-1 ml-sm-0 text-nowrap">
                    Parent Hash:
                  </div>
                  <div class="col-span-2">{block.parent?.hash}</div>
                </td>
              </tr>
            </>
          )}
        </components.DynamicTable>
      </components.TableView>

      <components.TableView
        classes="w-screen max-w-5xl"
        title={`Transactions (${block.txList?.length})`}
        dontNeedSubtitle={true}
      >
        <components.DynamicTable columns={columns}>
          {loading ? (
            <tr>
              <td colSpan={columns?.length}>
                <components.Loading />
              </td>
            </tr>
          ) : (
            block.txList &&
            block.txList.map((item, index) => (
              <DynamicTableRow item={item} key={index} />
            ))
          )}
        </components.DynamicTable>
      </components.TableView>
    </div>
  )
}
const DynamicTableRow = ({ item }) => {
  return (
    <tr>
      <td className="px-2 text-sm truncate   py-3">
        <Link className="text-blue-500" to={`/transactions/${item.hash}`}>
          {' '}
          {formatHash(item.hash)}
        </Link>
      </td>
      <td className="px-2 text-sm truncate   py-3">
        <Link
          to={`/blocks/${formatHexToInt(item.block.number)}`}
          className="text-blue-500"
        >
          #{formatHexToInt(item.block.number)}
        </Link>
      </td>
      <td className="px-2 text-sm truncate   py-3">
        <div className="d-sm-block small text-secondary ml-1 ml-sm-0 text-nowrap">
          {moment.unix(item.block.timestamp).fromNow()}
        </div>
      </td>
      <td className="px-2 text-sm truncate   py-3">
        <Link className="text-blue-500" to={`/address/${item.from}`}>
          {' '}
          {formatHash(item.from)}
        </Link>
      </td>
      <td className="px-2 text-sm truncate   py-3">
        <Link className="text-blue-500" to={`/address/${item.to}`}>
          {' '}
          {formatHash(item.to)}
        </Link>
      </td>
      <td className="px-2 text-sm truncate   py-3">
        {numToFixed(ethers.utils.formatEther(item.value), 2)} FTM
      </td>
      <td className="px-2 text-sm truncate   py-3">
        <span className="text-sm">{formatHexToInt(item.gasUsed)}</span>
      </td>
    </tr>
  )
}