<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentCase extends Model
{
    protected $fillable = [
        'school_id',
        'program_id',
        'academic_period_id',
        'submitted_by',
        'student_no',
        'student_name',
        'year_level',
        'section',
        'birthdate',
        'case_type',
        'destination',
        'reason',
        'removed_at',
        'removed_by',
        'retention_submission_id',
    ];

    protected function casts(): array
    {
        return [
            'birthdate' => 'date',
            'removed_at' => 'datetime',
        ];
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

    public function removedBy()
    {
        return $this->belongsTo(User::class, 'removed_by');
    }

    public function retentionSubmission()
    {
        return $this->belongsTo(RetentionRate::class, 'retention_submission_id');
    }
}
