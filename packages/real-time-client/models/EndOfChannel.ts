interface EndOfChannel {
  message: 'EndOfChannel';
  channel: string;
  last_seq_no: number;
}
export default EndOfChannel;
