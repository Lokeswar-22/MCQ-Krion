/* eslint-disable prettier/prettier */
import { Controller, Post, Put, Delete, Body, Get, Param } from '@nestjs/common';
import { ExcelService } from './excel.service';

@Controller()
export class ExcelController {
  constructor(private readonly excelService: ExcelService) {}

  @Get('excel')
  getExcelData(): any[] {
    return this.excelService.convertExcelToJSON('../mcq-backend/Book.xlsx', 'Sheet1').slice(1); // Remove header row
  }

  @Get('questions')
  getQuestions(): any[] {
    const excelData = this.excelService.convertExcelToJSON('../mcq-backend/Book.xlsx', 'Sheet1').slice(1);
    return excelData.map(row => ({ question: row[1], options: row.slice(2, 6) }));
  }

  @Get('questions/:id')
  getQuestionById(@Param('id') id: string): any {
    const excelData = this.excelService.convertExcelToJSON('../mcq-backend/Book.xlsx', 'Sheet1').slice(1);
    const question = excelData.find(row => row[0] === parseInt(id));
    if (!question) {
      return 'Question not found';
    }
    return {
      question: question[1],
      options: question.slice(2, 6)
    };
  }

  @Post('answer/:id')
  async submitAnswer(@Param('id') id: string, @Body() body: { answer: string, candidateName: string }): Promise<string> {
    const excelDataSheet1 = this.excelService.convertExcelToJSON('../mcq-backend/Book.xlsx', 'Sheet1');
    const excelDataSheet2 = this.excelService.convertExcelToJSON('../mcq-backend/Book.xlsx', 'Sheet2');
    
    const question = excelDataSheet1.find(row => row[0] === parseInt(id));
    if (!question) {
      return 'Question not found';
    }
    
    const correctAnswer = question[6];
    const validationValue = 5;
    const candidateRow = excelDataSheet2.find(row => row[1] === body.candidateName);
    if (!candidateRow) {
      return 'Candidate not found';
    }
    
    const questionIndex = parseInt(id) + 2; // Q1 is in the 3rd column
    candidateRow[questionIndex] = body.answer === correctAnswer ? validationValue : 0;
    
    const totalColumnIndex = 23;
    candidateRow[totalColumnIndex] = candidateRow.slice(3, 23).reduce((sum, val) => sum + (val || 0), 0);
    
    await this.excelService.writeJSONToExcel('../mcq-backend/Book.xlsx', 'Sheet2', excelDataSheet2);
    return 'Answer submitted successfully!';
  }

  @Get('marks/:candidateName')
  async getTotalMarks(@Param('candidateName') candidateName: string): Promise<any> {
    const excelData = this.excelService.convertExcelToJSON('../mcq-backend/Book.xlsx', 'Sheet2').slice(1); // Remove header row
    const candidateRow = excelData.find(row => row[1] === candidateName);
    if (!candidateRow) {
      return 'Candidate not found';
    }
    const totalMarks = candidateRow[23];
    return { candidateName, totalMarks };
  }

  @Get('candidateinfo')
  getCandidateInfo(): any[] {
    const excelData = this.excelService.convertExcelToJSON('../mcq-backend/Book.xlsx', 'Sheet2').slice(1); // Remove header row
    return excelData.map(row => ({ id: row[0], candidateName: row[1], candidateRegisterNumber: row[2], totalMarks:row[23] }));
  }
  @Post('candidateinfo')
  addCandidate(@Body() body: { candidateName: string, candidateRegisterNumber: string, adminName: string, adminRegNumber: string }): string {
    if (body.adminName !== 'admin' || body.adminRegNumber !== 'adminhr123') {
      return 'Unauthorized access';
    }

    const excelData = this.excelService.convertExcelToJSON('../mcq-backend/Book.xlsx', 'Sheet2');
    const newId = excelData.length;
    const newCandidate = [newId, body.candidateName, body.candidateRegisterNumber, ...Array(20).fill(0), 0];
    excelData.push(newCandidate);

    this.excelService.writeJSONToExcel('../mcq-backend/Book.xlsx', 'Sheet2', excelData);
    return 'Candidate added successfully';
  }

  @Put('candidateinfo/:id')
  updateCandidate(@Param('id') id: string, @Body() body: { candidateName: string, candidateRegisterNumber: string, adminName: string, adminRegNumber: string }): string {
    if (body.adminName !== 'admin' || body.adminRegNumber !== 'adminhr123') {
      return 'Unauthorized access';
    }

    const excelData = this.excelService.convertExcelToJSON('../mcq-backend/Book.xlsx', 'Sheet2');
    const candidate = excelData.find(row => row[0] === parseInt(id));
    if (!candidate) {
      return 'Candidate not found';
    }

    candidate[1] = body.candidateName;
    candidate[2] = body.candidateRegisterNumber;

    this.excelService.writeJSONToExcel('../mcq-backend/Book.xlsx', 'Sheet2', excelData);
    return 'Candidate updated successfully';
  }

  @Delete('candidateinfo/:id')
  deleteCandidate(@Param('id') id: string, @Body() body: { adminName: string, adminRegNumber: string }): string {
    if (body.adminName !== 'admin' || body.adminRegNumber !== 'adminhr123') {
      return 'Unauthorized access';
    }

    let excelData = this.excelService.convertExcelToJSON('../mcq-backend/Book.xlsx', 'Sheet2');
    const candidateIndex = excelData.findIndex(row => row[0] === parseInt(id));
    if (candidateIndex === -1) {
      return 'Candidate not found';
    }

    excelData.splice(candidateIndex, 1);
    excelData = excelData.map((row, index) => [index, ...row.slice(1)]); 

    this.excelService.writeJSONToExcel('../mcq-backend/Book.xlsx', 'Sheet2', excelData);
    return 'Candidate deleted successfully';
  }
}
