import { Document, Page, StyleSheet, Text, renderToBuffer } from "@react-pdf/renderer";
import React from "react";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 11,
    fontFamily: "Helvetica"
  },
  heading: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: 700
  },
  line: {
    marginBottom: 4
  }
});

function ResumePdf({ content }: { content: string }) {
  const lines = content.split("\n").filter((line) => line.trim().length > 0);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.heading}>HireBoost AI Optimized Resume</Text>
        {lines.map((line, index) => (
          <Text key={`${line}-${index}`} style={styles.line}>
            {line}
          </Text>
        ))}
      </Page>
    </Document>
  );
}

export async function generateResumePdf(content: string) {
  return renderToBuffer(<ResumePdf content={content} />);
}
