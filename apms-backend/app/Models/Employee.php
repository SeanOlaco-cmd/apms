<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    protected $table = 'employee_data';

    protected $fillable = [
        'school_id',
        'program_id',
        'academic_period_id',
        'employee_name',
        'position',
        'employment_type',
        'submitted_by',
        'status',
        'rejection_reason',
        'approved_by',
        'approved_at',
    ];

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