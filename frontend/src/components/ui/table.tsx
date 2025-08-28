import * as React from "react"

import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
      <table
        className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
        role="table"
      >
        <thead className="bg-gray-50 dark:bg-gray-800" role="rowgroup">
          <tr role="row">
            {props.columns.map((col: any) => (
              <th
                key={col.key}
                role="columnheader"
                scope="col"
                className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                {col.header}
              </th>
            ))}
            {props.actions && <th className="px-4 py-2" />}
          </tr>
        </thead>
        <tbody
          className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900"
          role="rowgroup"
        >
          {props.data.length === 0 && (
            <tr role="row">
              <td
                colSpan={
                  props.columns.length + (props.actions ? 1 : 0)
                }
                className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                No data
              </td>
            </tr>
          )}
          {props.data.map((row: any, i: number) => (
            <tr
              key={row.id || i}
              role="row"
              className="even:bg-gray-50 hover:bg-gray-100 dark:even:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            >
              {props.columns.map((col: any) => (
                <td
                  key={col.key}
                  role="cell"
                  className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
                >
                  {col.render
                    ? col.render(row[col.key], row)
                    : (row[col.key] as any)}
                </td>
              ))}
              {props.actions && (
                <td className="px-4 py-2" role="cell">
                  {props.actions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-gray-100 even:bg-gray-50 data-[state=selected]:bg-gray-200 border-b transition-colors",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
