<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// A single student movement. Stays a draft (retention_report_id = null)
// until the Department Head submits the period's report.
class RetentionRecord extends Model
{
    protected $fillable = [
        'retention_report_id',
        'school_id',
        'program_id',
        'academic_period_id',
        'student_no',
        'student_name',
        'type',
        'reason',
        'record_date',
        'notes',
        'recorded_by',
    ];

    public function report()
    {
        return $this->belongsTo(RetentionReport::class, 'retention_report_id');
    }
    public function school()
    {
        return $this->belongsTo(School::class);
    }
    public function program()
    {
        return $this->belongsTo(Program::class);
    }
    public function academicPeriod()
    {
        return $this->belongsTo(AcademicPeriod::class);
    }
}
