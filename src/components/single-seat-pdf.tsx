"use client"
import type { Seat } from "@/types/booking"
import { Document, Page, Text, View, StyleSheet, BlobProvider } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#fff",
    padding: 30,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  row: {
    flexDirection: "row",
    marginBottom: 10,
  },
  label: {
    width: 100,
    fontWeight: "bold",
  },
  value: {
    flex: 1,
  },
})

interface SeatPDFDocumentProps {
  seat: Seat
}

const SeatPDFDocument = ({ seat }: SeatPDFDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Seat Booking Details</Text>
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>
            {seat.user?.firstname} {seat.user?.lastname}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Table:</Text>
          <Text style={styles.value}>{seat.tableNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Seat:</Text>
          <Text style={styles.value}>{seat.seatNumber}</Text>
        </View>
      </View>
    </Page>
  </Document>
)

export const SingleSeatPDF = ({ seat }: { seat: Seat }) => (
  <BlobProvider document={<SeatPDFDocument seat={seat} />}>
    {({ url, loading }) => {
      if (loading) return <span>Loading...</span>;
      return (
        <a 
          href={url!} 
          download={`booking-${seat.tableNumber}-${seat.seatNumber}.pdf`}
          className="inline-flex items-center"
        >
          Download PDF
        </a>
      );
    }}
  </BlobProvider>
)